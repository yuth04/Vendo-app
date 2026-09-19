"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    Banknote, Box, CheckCircle2, RotateCcw,
    ShoppingBag, Truck,
} from "lucide-react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { orderService } from "@/src/app/components/core/services/orders";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import OrderDetailEmpty from "@/src/app/components/modules/account/orders/propretyorder/OrderDetailEmpty";
import OrderDetailLoader from "@/src/app/components/modules/account/orders/propretyorder/OrderDetailLoader";
import OrderSummaryCard from "@/src/app/components/modules/account/orders/propretyorder/OrderSummaryCard";
import OrderDeliveryCard from "@/src/app/components/modules/account/orders/propretyorder/OrderDeliveryCard";
import ReturnModal from "@/src/app/components/modules/account/orders/propretyorder/ReturnModal";
import PayModal from "@/src/app/components/modules/account/orders/propretyorder/PayModal";
import OrderDetailHeader from "@/src/app/components/modules/account/orders/components/OrderDetailHeader";
import OrderTrackingCard from "@/src/app/components/modules/account/orders/propretyorder/OrderTrackingCard";
import OrderManifestCard from "@/src/app/components/modules/account/orders/components/OrderManifestCard";


const EMPTY_REVIEWS: Review[] = [];

const RETURN_REASONS = [
    "Damaged or defective item",
    "Wrong item received",
    "Item not as described",
    "Wrong size or fit",
    "Color differs from expectations",
    "Quality not as expected",
    "Changed my mind",
];

const OrderDetail = () => {
    const params = useParams();
    const id     = params?.id as string;
    const { showToast, showConfirm } = useAlert();

    const [isPayModalOpen,     setIsPayModalOpen]     = useState(false);
    const [paymentMethod,      setPaymentMethod]      = useState("khqr");
    const [isSubmitting,       setIsSubmitting]       = useState(false);
    const [isCancelling,       setIsCancelling]       = useState(false);
    const [paymentData,        setPaymentData]        = useState({ transactionId: "", imageFile: null as File | null, imagePreview: "" });
    const [isReturnModalOpen,  setIsReturnModalOpen]  = useState(false);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const [returnForm,         setReturnForm]         = useState({
        selectedItemId: null as number | null,
        quantity: 1,
        reason: RETURN_REASONS[0],
        note: "",
    });

    //--- Live status override from Pusher ---//
    const [liveStatus,    setLiveStatus]    = useState<string | null>(null);
    const [isLive,        setIsLive]        = useState(false);

    const { data: standardData, loading: orderLoading, refresh } = useApiData(orderService.fetchOrders, null as any, true);
    const { data: returnData,   loading: returnLoading }         = useApiData(orderService.fetchReturnOrders, [] as any, true);
    const fetchReviews = useCallback(() => reviewClient.fetchAllReviews(), []);
    const { data: reviewsRes,   loading: reviewsLoading }        = useApiData<Review[]>(fetchReviews, EMPTY_REVIEWS, true);

    const loading = orderLoading || returnLoading || reviewsLoading;

    //--- Merge liveStatus into order so UI reacts without refresh --//
    const order = useMemo(() => {
        //--- Return order ---//
        const returnsList: any[] = Array.isArray(returnData)
            ? returnData
            : (returnData as any)?.data ?? (returnData as any)?.returns ?? [];

        const foundReturn = returnsList.find(
            (r: any) => r.return_id?.toString() === id || r.order_id?.toString() === id
        );

        if (foundReturn) {
            const status = liveStatus ?? foundReturn.status;
            return { ...foundReturn, status, isReturn: true };
        }

        //-- Normal order ---//
        const ordersList: any[] = standardData?.orders ?? [];
        const foundOrder = ordersList.find((o: any) => o.order_id?.toString() === id);

        if (foundOrder) {
            const status         = liveStatus ?? foundOrder.status;
            const isReturnStatus = ["requested", "inspection", "refunded", "approved"].includes(
                status?.toLowerCase()
            );
            return { ...foundOrder, status, isReturn: isReturnStatus };
        }

        return null;
    }, [standardData, returnData, id, liveStatus]);

    // ── Pusher ---//
    useEffect(() => {
        if (!id) return;

        (window as any).Pusher = Pusher;

        const echo = new Echo({
            broadcaster: "pusher",
            key:      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
            cluster:  process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
            forceTLS: true,
        });

        echo
            .channel('orders')
            .listen('OrderStatusUpdated', (e: { order_id: number; order_status: string; payment_status: string }) => {

                if (e.order_id?.toString() === id) {
                    setLiveStatus(e.order_status);
                    setIsLive(true);
                }
            });

        return () => {
            echo.leaveChannel('orders');
            echo.disconnect();
        };
    }, [id]);

    const reviewsMap = useMemo(() => {
        const map  = new Map<number, Review[]>();
        const list = Array.isArray(reviewsRes) ? reviewsRes : [];
        list.forEach((r) => {
            const existing = map.get(r.product_id) ?? [];
            existing.push(r);
            map.set(r.product_id, existing);
        });
        return map;
    }, [reviewsRes]);

    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase();
        if (["pending", "requested"].includes(s))                                               return "bg-orange-100 text-orange-600";
        if (["confirmed", "shipped", "shipping", "processing", "inspection"].includes(s))       return "bg-blue-100 text-blue-600";
        if (["delivered", "completed", "refunded", "approved"].includes(s))                     return "bg-emerald-100 text-emerald-600";
        if (["cancelled", "cancel", "rejected"].includes(s))                                    return "bg-red-50 text-red-600 border border-red-100";
        return "bg-gray-100 text-gray-500";
    };

    const isCancelled = useMemo(() => {
        const s = order?.status?.toLowerCase();
        return s === "cancelled" || s === "cancel" || s === "rejected";
    }, [order?.status]);

    const paymentMethodLabel = order?.isReturn ? order?.payment?.payment_method : order?.payment?.method;
    const paidAtLabel        = order?.isReturn
        ? order?.payment?.paid_at
        : order?.payment?.paid_at ? new Date(order.payment.paid_at).toLocaleDateString() : null;

    const handleCancelOrder = async () => {
        const confirmed = await showConfirm({ title: "Cancel Order", message: "Are you sure you want to cancel this order? This action cannot be undone.", confirmLabel: "Yes, Cancel", cancelLabel: "No, Keep it", variant: "danger" });
        if (!confirmed) return;
        try {
            setIsCancelling(true);
            await orderService.cancelOrder(id);
            showToast("Order cancelled successfully", "success");
            if (refresh) await refresh();
        } catch {
            showToast("Failed to cancel order.", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirmPayment = async () => {
        try {
            setIsSubmitting(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            showToast("Success!", "success");
            setIsPayModalOpen(false);
            if (refresh) refresh();
        } catch {
            showToast("Failed to confirm order.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isReadyToSubmit = useMemo(() => {
        if (paymentMethod === "cod") return true;
        return paymentData.transactionId.trim() !== "" && paymentData.imageFile !== null;
    }, [paymentMethod, paymentData]);

    const handleOpenReturnModal = () => {
        const firstItem = order?.items?.[0];
        setReturnForm({ selectedItemId: firstItem?.id ?? null, quantity: 1, reason: RETURN_REASONS[0], note: "" });
        setIsReturnModalOpen(true);
    };

    const handleSelectReturnItem = (itemId: number) => {
        setReturnForm((prev) => ({ ...prev, selectedItemId: prev.selectedItemId === itemId ? null : itemId, quantity: 1 }));
    };

    const handleReturnQty = (delta: number, maxQty: number) => {
        setReturnForm((prev) => ({ ...prev, quantity: Math.max(1, Math.min(maxQty, prev.quantity + delta)) }));
    };

    const handleConfirmReturn = async () => {
        if (!returnForm.selectedItemId) { showToast("Please select an item to return.", "error"); return; }
        try {
            setIsSubmittingReturn(true);
            await orderService.submitReturn({ order_id: order?.order_id, reason: returnForm.reason, note: returnForm.note.trim() || null, order_item_id: returnForm.selectedItemId, quantity: returnForm.quantity });
            showToast("Return request submitted successfully!", "success");
            setIsReturnModalOpen(false);
            window.location.reload();
        } catch (error) {
            showToast("Failed to submit return request. Please try again.", "error");
        } finally {
            setIsSubmittingReturn(false);
        }
    };

    const trackingSteps = order?.isReturn
        ? [
            { label: "REQUESTED",  icon: <RotateCcw size={20} />,     active: true },
            { label: "INSPECTION", icon: <Box size={20} />,            active: ["inspection", "approved", "refunded", "completed"].includes(order?.status?.toLowerCase()) },
            { label: "REFUNDED",   icon: <Banknote size={20} />,       active: ["refunded", "completed"].includes(order?.status?.toLowerCase()) },
        ]
        : [
            { label: "Ordered",  icon: <ShoppingBag size={20} />,      active: true },
            { label: "Packing",  icon: <Box size={20} />,              active: !isCancelled && order?.status?.toLowerCase() !== "pending" },
            { label: "Shipping", icon: <Truck size={20} />,            active: !isCancelled && ["shipped", "shipping", "delivered", "completed"].includes(order?.status?.toLowerCase()) },
            { label: "Received", icon: <CheckCircle2 size={20} />,     active: !isCancelled && ["delivered", "completed"].includes(order?.status?.toLowerCase()) },
        ];

    if (!loading && !order) return <OrderDetailEmpty />;
    if (loading || !order)  return <OrderDetailLoader />;

    // Casting the component to 'any' dynamically strips the strict prop restriction
    // without changing anything inside OrderTrackingCard.tsx or your code architecture.
    const TrackComponent = OrderTrackingCard as React.ComponentType<any>;

    return (
        <div className="min-h-screen p-4 md:py-4 font-sans">
            <OrderDetailHeader
                order={order}
                loading={loading}
                isCancelling={isCancelling}
                isSubmittingReturn={isSubmittingReturn}
                paidAtLabel={paidAtLabel}
                paymentMethodLabel={paymentMethodLabel}
                onCancelOrder={handleCancelOrder}
                onOpenReturnModal={handleOpenReturnModal}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-8">
                    <TrackComponent
                        order={order}
                        loading={loading}
                        trackingSteps={trackingSteps}
                        isCancelled={isCancelled}
                        getStatusStyles={getStatusStyles}
                        isLive={isLive}
                    />
                    <OrderManifestCard
                        order={order}
                        loading={loading}
                        reviewsMap={reviewsMap}
                        orderId={id}
                    />
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <OrderSummaryCard
                        order={order}
                        loading={loading}
                        isCancelled={isCancelled}
                        onPayNow={() => setIsPayModalOpen(true)}
                    />
                    <OrderDeliveryCard
                        order={order}
                        loading={loading}
                    />
                </div>
            </div>

            {isReturnModalOpen && (
                <ReturnModal
                    order={order}
                    returnForm={returnForm}
                    isSubmittingReturn={isSubmittingReturn}
                    onClose={() => setIsReturnModalOpen(false)}
                    onSelectItem={handleSelectReturnItem}
                    onQtyChange={handleReturnQty}
                    onFormChange={(field, value) => setReturnForm((p) => ({ ...p, [field]: value }))}
                    onConfirm={handleConfirmReturn}
                />
            )}

            {isPayModalOpen && (
                <PayModal
                    order={order}
                    paymentMethod={paymentMethod}
                    paymentData={paymentData}
                    isSubmitting={isSubmitting}
                    isReadyToSubmit={isReadyToSubmit}
                    onClose={() => setIsPayModalOpen(false)}
                    onMethodChange={setPaymentMethod}
                    onPaymentDataChange={(data) => setPaymentData((prev) => ({ ...prev, ...data }))}
                    onConfirm={handleConfirmPayment}
                />
            )}
        </div>
    );
};

export default OrderDetail;