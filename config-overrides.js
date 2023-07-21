// module.exports = function override(config) {

//   // const alias = config.resolve.alias || {};
//   // Object.assign(alias, {
//   //   ws: 'global/WebSocket',
//   //   "buffer": "buffer",
//   // })
//   // config.resolve.alias = alias;

//   config.node = {
//     ...config.node,
//     Buffer: true,
//   };

//   const fallback = config.resolve.fallback || {};
//     Object.assign(fallback, {
//       // "crypto": require.resolve("crypto-browserify"),
//       crypto: false,
//       stream: false,
//       http: false,
//       https: false,
//       net: false,
//       tls: false,
//       url: false,
//       "buffer": require.resolve("buffer/"),
//     })
//     config.resolve.fallback = fallback;

//     return config;
// }


const webpack = require('webpack'); 
module.exports = function override(config) { 
		const fallback = config.resolve.fallback || {}; 
		Object.assign(fallback, { 
    	"crypto": require.resolve("crypto-browserify"), 
      "stream": require.resolve("stream-browserify"), 
      "assert": require.resolve("assert"), 
      "http": require.resolve("stream-http"), 
      "https": require.resolve("https-browserify"), 
      "os": require.resolve("os-browserify"), 
      "url": require.resolve("url"),
      net: false,
      tls: false,
      zlib: false,
    }) 
   config.resolve.fallback = fallback; 
   config.plugins = (config.plugins || []).concat([ 
   	new webpack.ProvidePlugin({ 
    	process: 'process/browser', 
      Buffer: ['buffer', 'Buffer'] 
    }) 
   ]) 
   return config; }