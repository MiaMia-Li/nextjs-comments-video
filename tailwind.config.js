/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#f66c30", // 主色调 - 橙红色
          hover: "#ff8c5e", // 悬停时更亮的橙色
          background: "#f66c301a", // 主色调的半透明背景
          "background-hover": "#f66c3029", // 悬停时背景略微不透明
          contrast: "#ffffff", // 与主色调形成对比的白色
        },

        gray: {
          1: "#111210",
          2: "#181917",
          3: "#212220",
          4: "#282a27",
          5: "#2f312e",
          6: "#383a36",
          7: "#454843",
          8: "#5c625b",
          9: "#687066",
          10: "#767d74",
          11: "#afb5ad",
          12: "#eceeec",
        },
      },
      text: {
        DEFAULT: "#eceeec", // 使用 gray-12 作为默认文本颜色
        muted: "#afb5ad", // 可选的次要文本颜色
        dark: "#111210", // 深色文本
      },
    },
  },
  plugins: [],
};
