let blockingEnabled = false;
let blockedWebsites = [];

// Listener for messages from popup

// Load blocking status and blocked websites from storage
chrome.storage.sync.get(["blockingEnabled", "blockedWebsites"], function(data) {
  console.log("background.js running");
  blockingEnabled = data.blockingEnabled || false;
  blockedWebsites = data.blockedWebsites || [];
  console.log("intial mode:", blockingEnabled);
  if(blockingEnabled){
    initialClear();
  }
});

chrome.runtime.onMessage.addListener((message) => {

    if (message.action === "toggleBlockingMode") {
        blockingEnabled = message.blockingEnabled;
        console.log("listening for toggle: ", blockingEnabled);
        if (blockingEnabled){
          initialClear();
        }
    }

    else if(message.action === "intialClear"){
        if(blockingEnabled){
            initialClear();
        }
    }

    else if (message.action === "updateBlockedWebsites"){
        console.log("updating blocked list");
        blockedWebsites = message.newList
        initialClear();
    }
})

//new tab or refresh
chrome.tabs.onUpdated.addListener(( tabId, changeInfo, tab)=> {
    if (changeInfo.status === 'loading'){
        checkBlocked(tab);
    }
});

function checkBlocked(tab) {
  if (blockingEnabled){
    const tabHostname = new URL(tab?.url).hostname;
    console.log("host name", tabHostname);
    console.log("blocked list", blockedWebsites);
    if (blockedWebsites.includes(tabHostname)) {
      console.log("match");
      const redirectUrl = chrome.runtime.getURL("blocked.html");
      chrome.tabs.update(tab.id, { url: redirectUrl });
    }

  }
};

function initialClear(){
  if (blockingEnabled){
    chrome.tabs.query({}, function(tabs) {
      const currentUrl = new URL(tabs[0].url);
      const currentHost = currentUrl.hostname;
      if (blockedWebsites.includes(currentHost)){
        chrome.tabs.remove(tabs[0].id);
      }
      tabs.forEach(tab => {
        const tabHostname = new URL(tab.url).hostname;
        console.log("host name", tabHostname);
        console.log("blocked list", blockedWebsites);
        if (blockedWebsites.includes(tabHostname)) {
          console.log("match");
         
          const redirectUrl = chrome.runtime.getURL("blocked.html");
          chrome.tabs.update(tab.id, { url: redirectUrl });
        }
      });
    });
  }
 
};


