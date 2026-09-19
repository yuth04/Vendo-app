import HeroSection from "@/src/app/components/modules/home/components/Hero-Section"
import CategoriesNav from "@/src/app/components/modules/home/components/Categories-Nav"
import ProductPopular from "@/src/app/components/modules/home/components/ProductPopular";
import BannerProduct from "@/src/app/components/modules/home/components/BannerProduct";
import PopularBrands from "@/src/app/components/modules/home/components/PopularBrands";
import TopSale from "@/src/app/components/modules/home/components/TopSale";
import NewProducts from "@/src/app/components/modules/home/components/NewProducts";

export default function PageHome() {
    return (
        <main>
            <HeroSection />
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-4 sm:py-10">
                <CategoriesNav />
                <NewProducts/>
                <TopSale/>
                <ProductPopular/>
                <BannerProduct/>
                <PopularBrands/>
            </div>
        </main>
    )
}
