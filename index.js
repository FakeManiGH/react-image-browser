import ImageBrowser from './imageBrowser.jsx';

// ES6 export
export { ImageBrowser };

// CommonJS export
module.exports = {
    ImageBrowser: require('./imageBrowser.jsx').default
};