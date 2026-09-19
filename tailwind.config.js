/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    // plugins: [
    //     require('tw-animate-css'),
    // ],
    theme: {
        extend: {
            fontFamily: {
                roboto: ["var(--font-roboto)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
