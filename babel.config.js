module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@components": "./scr/components",
            "@hooks": "./scr/hooks",
            "@services": "./scr/Services",
            "@css": "./app/css",
          },
        },
      ],
    ],
  };
};