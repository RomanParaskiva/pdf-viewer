module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: [
            ">1%",
            "last 10 versions",
            "Firefox ESR",
            "not ie < 9",
          ],
        },
        useBuiltIns: "entry",
        corejs: 3,
      },
    ],
    "@babel/preset-react",
  ];

  const plugins = [
    "transform-class-properties",
    "transform-object-rest-spread",
  ];

  return {
    presets,
    plugins,
  };
};
