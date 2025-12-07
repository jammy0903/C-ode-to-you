module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'react',
          jsxRuntime: 'automatic',
        },
      ],
    ],
    plugins: [
      // 개발 모드에서는 Tamagui extraction 비활성화 (TypeScript config 파싱 문제 방지)
      ...(process.env.NODE_ENV === 'production'
        ? [
            [
              '@tamagui/babel-plugin',
              {
                components: ['tamagui'],
                config: './tamagui.config.ts',
                logTimings: false,
                disableExtraction: false,
              },
            ],
          ]
        : []),
      'react-native-reanimated/plugin',
    ],
  };
};

