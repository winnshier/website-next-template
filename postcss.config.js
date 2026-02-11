module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-pxtorem': {
      // 根字体大小基准值
      // 这里设置为 16，因为我们的动态根字体是基于 16px 计算的
      rootValue: 16,

      // 需要转换的 CSS 属性，'*' 表示所有属性
      propList: ['*'],

      // 不需要转换的选择器（使用正则表达式）
      selectorBlackList: [
        // 排除 Tailwind 的类（Tailwind 已经使用 rem）
        /^\.text-/,
        /^\.leading-/,
        /^\.tracking-/,

        // 如果有其他不想转换的类，可以添加在这里
        // 例如：/^\.no-convert/
      ],

      // 是否替换原来的 px 值
      replace: true,

      // 是否在媒体查询中转换 px
      mediaQuery: false,

      // 最小转换的 px 值，小于这个值的不转换
      // 设置为 1，表示 1px 及以上都转换
      minPixelValue: 1,

      // 排除的文件或文件夹
      exclude: /node_modules/i,
    },
  },
}
