const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

export default () => flushPromises().then(flushPromises);
