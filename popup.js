document.addEventListener("DOMContentLoaded", function() {
    const addCurrentTabButton = document.getElementById("addCurrentTabButton");
    const blockedWebsitesList = document.getElementById("blockedWebsitesList");
    const toggleBlockingButton = document.getElementById("toggleBlockingButton");
    const clearBlockedWebsitesButton = document.getElementById("clearBlockedWebsitesButton");

    var blockingEnabled = null;
    var blockedWebsites = [];
    // Load blocking status from storage and update the UI accordingly
    chrome.storage.sync.get("blockingEnabled", function(data) {
      blockingEnabled = data.blockingEnabled || false;
      updateBlockingStatus(blockingEnabled);
  
    });
  
    // Load the blocked websites from storage and populate the list
    chrome.storage.sync.get("blockedWebsites", function(data) {
      blockedWebsites = data.blockedWebsites || [];
      blockedWebsites.forEach(website => addBlockedWebsiteToList(website));
  
    });
  
    //button for adding the current website to the blocked list
    addCurrentTabButton.addEventListener("click", function() {
      // Get the active tab's URL and extract the host name
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
          const currentUrl = new URL(tabs[0].url);
          const currentHost = currentUrl.hostname;
          console.log("current host", currentHost);
          if (blockedWebsites.includes(currentHost)){
              console.log("already added");
          }
          else{
            console.log( "adding", currentHost);
            blockedWebsites.push(currentHost);
            updateBlockedWebsites(blockedWebsites);
            addBlockedWebsiteToList(currentHost);
            chrome.runtime.sendMessage({
            action: "updateBlockedWebsites",
            newList: blockedWebsites
            });
          }
        }
      });
    });
  
    function addBlockedWebsiteToList(websiteUrl) {
      const listItem = document.createElement("li");
    
      const contentWrapper = document.createElement("div");
      contentWrapper.classList.add("list-item-content");
    
      const websiteText = document.createElement("span");
      websiteText.textContent = websiteUrl;
    
      const removeButton = document.createElement("button");
      removeButton.textContent = "x";
      removeButton.classList.add("remove-button");
      removeButton.addEventListener("click", function() {
        removeBlockedWebsite(websiteUrl, listItem);
      });
    
      contentWrapper.appendChild(websiteText);
      contentWrapper.appendChild(removeButton);
      listItem.appendChild(contentWrapper);
    
      blockedWebsitesList.appendChild(listItem);
    }
    
    function updateBlockedWebsites(blockedWebsites_) {
      chrome.storage.sync.set({ blockedWebsites: blockedWebsites_ });
    }
  
    //toggles the blocking mode between enabled and disabled
    toggleBlockingButton.addEventListener("click", function() {
      console.log("toggleBlockingButton hit");
      blockingEnabled = !blockingEnabled;
      updateBlockingStatus(blockingEnabled);
    
    });
    //changes the block button UI and stored the current mode in chrome storage
    function updateBlockingStatus(blockingEnabled) {
      console.log("sending blocking mode ", blockingEnabled, "to background script");
      toggleBlockingButton.textContent = blockingEnabled ? "Disable Blocking" : "Enable Blocking";
      chrome.runtime.sendMessage({
        action: "toggleBlockingMode",
        blockingEnabled: blockingEnabled,
      });
      console.log("storing ", blockingEnabled, " mode");
      chrome.storage.sync.set({ blockingEnabled: blockingEnabled });
    }
  
    clearBlockedWebsitesButton.addEventListener("click", function() {
      
      blockedWebsites= []; //popup.js
      updateBlockedWebsites([]); //data
      clearBlockedWebsitesList(); //UI
      chrome.runtime.sendMessage({ //background.js
        action: "updateBlockedWebsites",
        newList: [],
      })
    });
  
    function clearBlockedWebsitesList() {
      blockedWebsitesList.innerHTML = ""; // Clear the UI list
    }

    function removeBlockedWebsite(websiteUrl, listItem) {
       // Remove the website from the blockedWebsites array in popup.js
       blockedWebsites = blockedWebsites.filter(website => website !== websiteUrl);
    
       // Update the blockedWebsites array in data
       updateBlockedWebsites(blockedWebsites);
      // Remove the website from the UI
      listItem.remove();

      //background.js
      chrome.runtime.sendMessage({
        action: "updateBlockedWebsites",
        newList: blockedWebsites
      })
    
    } 
  
  });
  
  
  
  
  
  
  
  
  
  