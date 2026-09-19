# VENDO App — Frontend

VENDO is a modern e-commerce web application frontend built with **Next.js**. It provides customers with a responsive interface for browsing products, managing their cart, placing orders, making payments, and viewing their order history.

## 🚀 Features

* 🛍️ Browse and search products
* 📂 Browse products by category
* 🔎 Product details and variants
* 🛒 Shopping cart management
* ❤️ Wishlist
* 👤 User authentication and profile
* 📦 Order placement and order history
* 🔄 Return, refund, and exchange requests
* 💳 Payment integration
* 📍 Shipping and delivery address management
* 📱 Responsive design for desktop, tablet, and mobile
* ⚡ Fast navigation with Next.js
* 🔔 User notifications and feedback

## 🛠️ Technologies

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Axios**
* **React Hook Form**
* **Zod**
* **Lucide React**
* **Next.js App Router**

## 📁 Project Structure

```text
vendo-app/
├── app/
│   ├── (auth)/
│   ├── cart/
│   ├── checkout/
│   ├── products/
│   ├── orders/
│   ├── order-history/
│   ├── profile/
│   ├── returns/
│   └── ...
│
├── components/
│   ├── ui/
│   ├── product/
│   ├── cart/
│   ├── order/
│   └── ...
│
├── lib/
│   ├── api/
│   ├── utils/
│   └── ...
│
├── public/
│   ├── images/
│   └── ...
│
├── types/
├── hooks/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Navigate to the project

```bash
cd vendo-app
```

### 3. Install dependencies

```bash
npm install
```

Or:

```bash
yarn install
```

```bash
pnpm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Update the API URL according to your backend configuration.

### 5. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The application will automatically reload when you make changes.

## 🔗 Backend

The VENDO frontend communicates with the VENDO backend through RESTful APIs.

### Backend Stack

* Laravel
* PHP
* PostgreSQL
* REST API
* Eloquent ORM

Example API configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Make sure the backend server is running before using features that require API communication.

## 📦 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint to check the codebase.

## 🔐 Authentication

The frontend communicates with the backend authentication system to provide:

* User registration
* User login
* Logout
* Authenticated requests
* User profile management
* Protected pages

Authentication-related API requests are handled through the frontend API layer.

## 🛒 E-Commerce Flow

The main customer flow is:

```text
Browse Products
      ↓
Product Details
      ↓
Select Variant
      ↓
Add to Cart
      ↓
Review Cart
      ↓
Checkout
      ↓
Select Address
      ↓
Select Payment Method
      ↓
Place Order
      ↓
Order Confirmation
      ↓
Order History
```

## 🔄 Return / Refund / Exchange

VENDO also supports post-purchase order management.

Customers can:

```text
Order History
      ↓
Select Order
      ↓
Request Return
      ↓
Select Item(s)
      ↓
Choose Return Type
      ├── Refund
      └── Exchange
```

Each returned item can have its own return type, allowing customers to request different actions for different items within the same return request.

## 💳 Payment

The frontend supports integration with the VENDO payment system and communicates with the backend payment APIs.

Payment-related functionality can include:

* Payment method selection
* Payment status
* Order payment confirmation
* Payment information
* Refund information

## 📱 Responsive Design

The application is designed to work across different screen sizes:

* Desktop
* Laptop
* Tablet
* Mobile

Tailwind CSS is used to build responsive layouts and reusable UI components.

## 🧩 Development

The project uses the **Next.js App Router**.

Pages and application routes are organized inside the `app` directory.

For example:

```text
app/
├── products/
│   └── page.tsx
├── cart/
│   └── page.tsx
├── checkout/
│   └── page.tsx
└── order-history/
    └── page.tsx
```

Reusable components are organized separately to keep the application maintainable and scalable.

## 🌐 Deployment

The application can be deployed using platforms that support Next.js, such as Vercel.

Create a production build:

```bash
npm run build
```

Then start the application:

```bash
npm run start
```

For deployment, configure the required environment variables in your hosting platform.

## 📚 Learn More

* [Next.js Documentation](https://nextjs.org/docs?utm_source=chatgpt.com)
* [React Documentation](https://react.dev/?utm_source=chatgpt.com)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs?utm_source=chatgpt.com)
* [TypeScript Documentation](https://www.typescriptlang.org/docs/?utm_source=chatgpt.com)

## 👨‍💻 Developer

**Nheung Phearakyuth**

Full Stack Developer

### VENDO Project

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Backend:** Laravel, PHP
* **Database:** PostgreSQL
* **Architecture:** RESTful API
* **Application:** E-Commerce Platform

---

⭐ If you find this project useful, feel free to give it a star!
