addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const PROXY_CONFIG = {
  '/json-storage/': 'https://arknights-toolbox-json-storage.lolicon.app/',
  '/proxy/': 'https://arknights-toolbox-proxy.lolicon.app/',
};

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const matchedProxy = Object.entries(PROXY_CONFIG).find(([path]) => url.pathname.startsWith(path));

    if (!matchedProxy) {
      return new Response('Not Found', { status: 404 });
    }

    const [proxyPath, targetBaseUrl] = matchedProxy;
    const targetPath = url.pathname.replace(proxyPath, '');
    const targetUrl = targetBaseUrl + targetPath + url.search;

    const headers = Object.fromEntries(request.headers.entries());
    delete headers['Host'];
    delete headers['host'];

    return await fetch(targetUrl, {
      ...request,
      headers,
    });
  } catch (error) {
    return new Response(String(error), { status: 500 });
  }
}
