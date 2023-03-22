/** JavaScript file of utility functions.
  * At present contains functions for sanitising of URLs,
  * since tomcat 8+, being more compliant with URL/URI standards, is more strict about URLs.
  */

/* 
   Given a string consisting of a single character, returns the %hex (%XX)
   https://www.w3resource.com/javascript-exercises/javascript-string-exercise-27.php
   https://stackoverflow.com/questions/40100096/what-is-equivalent-php-chr-and-ord-functions-in-javascript
   https://www.w3resource.com/javascript-exercises/javascript-string-exercise-27.php
*/
function urlEncodeChar(single_char_string) {
    /*let hex = Number(single_char_string.charCodeAt(0)).toString(16);
    var str = "" + hex;
    str = "%" + str.toUpperCase();
    return str;
    */

    var hex = "%" + Number(single_char_string.charCodeAt(0)).toString(16).toUpperCase();
    return hex;
}

/*
  Tomcat 8 appears to be stricter in requiring unsafe and reserved chars
  in URLs to be escaped with URL encoding
  See section "Character Encoding Chart of
  https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  Reserved chars:
     ; / ? : @ = &
     ----->  %3B %2F %3F %3A %40 %3D %26
  [Now also reserved, but no special meaning yet in URLs (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
  and not required to be enforced yet, so we're aren't at present dealing with these:
     ! ' ( ) *
  ]
  Unsafe chars:
     " < > # % { } | \ ^ ~ [ ] ` and SPACE/BLANK
     ----> %22 %3C %3E %23 %25 %7B %7D %7C %5C %5E ~ %5B %5D %60 and %20
  But the above conflicts with the reserved vs unreserved listings at
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
  Possibly more info: https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid

  And the bottom of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  lists additional characters that have been reserved since and which need encoding when in a URL component.

  Javascript already provides functions encodeURI() and encodeURIComponent(), see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
  However, the set of chars they deal with only partially overlap with the set of chars that need encoding as per the RFC3986 for URIs and RFC1738 for URLs discussed at
  https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  We want to handle all the characters listed as unsafe and reserved at https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  so we define and use our own conceptually equivalent methods for both existing JavaScript methods: 
  - makeSafeURL() for Javascript's encodeURI() to make sure all unsafe characters in URLs are escaped by being URL encoded
  - and makeSafeURLComponent() for JavaScript's encodeURIComponent to additionally make sure all reserved characters in a URL portion are escaped by being URL encoded too

  Function makeSafeURL() is passed a string that represents a URL and therefore only deals with characters that are unsafe in a URL and which therefore require escaping. 
  Function makeSafeURLComponent() deals with portions of a URL that when decoded need not represent a URL at all, for example data like inline templates passed in as a
  URL query string's parameter values. As such makeSafeURLComponent() should escape both unsafe URL characters and characters that are reserved in URLs since reserved
  characters in the query string part (as query param values representing data) may take on a different meaning from their reserved meaning in a URL context.
*/

/* URL encodes both 
   - UNSAFE characters to make URL safe, by calling makeSafeURL()
   - and RESERVED characters (characters that have reserved meanings within a URL) to make URL valid, since the url component parameter could use reserved characters
   in a non-URL sense. For example, the inline template (ilt) parameter value of a URL could use '=' and '&' signs where these would have XSLT rather than URL meanings.
  
   See end of https://www.w3schools.com/jsref/jsref_replace.asp to use a callback passing each captured element of a regex in str.replace()
*/
function makeURLComponentSafe(url_part, encode_percentages) {
    // https://stackoverflow.com/questions/12797118/how-can-i-declare-optional-function-parameters-in-javascript
    encode_percentages = encode_percentages || 1; // this method forces the URL-encoding of any % in url_part, e.g. do this for inline-templates that haven't ever been encoded
    
    var url_encoded = makeURLSafe(url_part, encode_percentages);
    //return url_encoded.replace(/;/g, "%3B").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/\:/g, "%3A").replace(/\@/g, "%40").replace(/=/g, "%3D").replace(/\&/g,"%26");
    url_encoded = url_encoded.replace(/[\;\/\?\:\@\=\&]/g, function(s) { 
	return urlEncodeChar(s);
    }); 
    return url_encoded;
}

/* 
   URL encode UNSAFE characters to make URL passed in safe.
   Set encode_percentages to 1 (true) if you don't want % signs encoded: you'd do so if the url is already partly URL encoded.
*/
function makeURLSafe(url, encode_percentages) {    
    encode_percentages = encode_percentages || 0; // https://stackoverflow.com/questions/12797118/how-can-i-declare-optional-function-parameters-in-javascript

    var url_encoded = url;
    if(encode_percentages) { url_encoded = url_encoded.replace(/\%/g,"%25"); } // encode % first
    //url_encoded = url_encoded.replace(/ /g, "%20").replace(/\"/g,"%22").replace(/\</g,"%3C").replace(/\>/g,"%3E").replace(/\#/g,"%23").replace(/\{/g,"%7B").replace(/\}/g,"%7D");
    //url_encoded = url_encoded.replace(/\|/g,"%7C").replace(/\\/g,"%5C").replace(/\^/g,"%5E").replace(/\[/g,"%5B").replace(/\]/g,"%5D").replace(/\`/g,"%60");
    // Should we handle ~, but then what is its URL encoded value? Because https://meyerweb.com/eric/tools/dencoder/ URLencodes ~ to ~.
    //return url_encoded;    
    url_encoded = url_encoded.replace(/[\ \"\<\>\#\{\}\|\\^\~\[\]\`]/g, function(s) { 
	return urlEncodeChar(s);
    });
    return url_encoded;
}

/***************
* MENU SCRIPTS *
***************/
function moveScroller() {
  var move = function() {
    var editbar = $("#editBar");
    var st = $(window).scrollTop();
    var fa = $("#float-anchor").offset().top;
    if(st > fa) {
      
      editbar.css({
	  position: "fixed",
	    top: "0px",
	    width: editbar.data("width"),
	    //width: "30%"
            });
    } else {
      editbar.data("width", editbar.css("width"));
      editbar.css({
	  position: "relative",
	    top: "",
	    width: ""
	    });
    }
  };
  $(window).scroll(move);
  move();
}


function floatMenu(enabled)
{
	var menu = $(".tableOfContentsContainer");
	if(enabled)
	{
		menu.data("position", menu.css("position"));
		menu.data("width", menu.css("width"));
		menu.data("right", menu.css("right"));
		menu.data("top", menu.css("top"));
		menu.data("max-height", menu.css("max-height"));
		menu.data("overflow", menu.css("overflow"));
		menu.data("z-index", menu.css("z-index"));
		
		menu.css("position", "fixed");
		menu.css("width", "300px");
		menu.css("right", "0px");
		menu.css("top", "100px");
		menu.css("max-height", "600px");
		menu.css("overflow", "auto");
		menu.css("z-index", "200");
		
		$("#unfloatTOCButton").show();
	}
	else
	{
		menu.css("position", menu.data("position"));
		menu.css("width", menu.data("width"));
		menu.css("right", menu.data("right"));
		menu.css("top", menu.data("top"));
		menu.css("max-height", menu.data("max-height"));
		menu.css("overflow", menu.data("overflow"));
		menu.css("z-index", menu.data("z-index"));
		
		$("#unfloatTOCButton").hide();
		$("#floatTOCToggle").prop("checked", false);
	}
	
	var url = gs.xsltParams.library_name + "?a=d&ftoc=" + (enabled ? "1" : "0") + "&c=" + gs.cgiParams.c;
	
	$.ajax(url);
}

// TK Label Scripts

var tkMetadataSetStatus = "needs-to-be-loaded";
var tkMetadataElements = null;


function addTKLabelToImage(labelName, definition, name, comment) {
   // lists of tkLabels and their corresponding codes, in order
   let tkLabels = ["Attribution","Clan","Family","MultipleCommunities","CommunityVoice","Creative","Verified","NonVerified","Seasonal","WomenGeneral","MenGeneral",
      "MenRestricted","WomenRestricted","CulturallySensitive","SecretSacred","OpenToCommercialization","NonCommercial","CommunityUseOnly","Outreach","OpenToCollaboration"];
   let tkCodes = ["tk_a","tk_cl","tk_f","tk_mc","tk_cv","tk_cr","tk_v","tk_nv","tk_s","tk_wg","tk_mg","tk_mr","tk_wr","tk_cs","tk_ss","tk_oc","tk_nc","tk_co","tk_o","tk_cb"];
    for (let i = 0; i < tkLabels.length; i++) {
      if (labelName == tkLabels[i]) {
         let labeldiv = document.querySelectorAll(".tklabels img");
         for (image of labeldiv) {
             let labelCode = image.src.substr(image.src.lastIndexOf("/") + 1).replace(".png", ""); // get tk label code from image file name
             if (labelCode == tkCodes[i]) {
               image.title = "TK " + name + ": " + definition + " Click for more details."; // set tooltip
               if (image.parentElement.parentElement.parentElement.classList[0] != "tocSectionTitle") { // disable onclick event in favourites section
                  image.addEventListener("click", function(e) {
                     let currPopup = document.getElementsByClassName("tkPopup")[0];
                     if (currPopup == undefined || (currPopup != undefined && currPopup.id != labelCode)) { 
                        let popup = document.createElement("div");
                        popup.classList.add("tkPopup");
                        popup.id = labelCode;
                        let popupText = document.createElement("span");
                        let heading = "<h1>Traditional Knowledge Label:<br><h2>" + name + "</h2></h1>";
                        let moreInformation = "<br> For more information about TK Labels, ";
                        let link = document.createElement("a");
                        link.innerHTML = "click here.";
                        link.href = "https://localcontexts.org/labels/traditional-knowledge-labels/";
                        link.target = "_blank";
                        popupText.innerHTML = heading + comment + moreInformation;
                        popupText.appendChild(link);
                        let closeButton = document.createElement("span");
                        closeButton.innerHTML = "&#215;";
                        closeButton.id = "tkCloseButton";
                        closeButton.title = "Click to close window."
                        closeButton.addEventListener("click", function(e) {
                           closeButton.parentElement.remove();
                        });
                        popup.appendChild(closeButton);
                        popup.appendChild(popupText);
                        e.target.parentElement.appendChild(popup);
                     }
                     if (currPopup) currPopup.remove(); // remove existing popup div
                  });
               }
            }
         }
      }
   }
}

function addTKLabelsToImages(lang) {
   if (tkMetadataElements == null) {
      console.error("ajax call not yet loaded tk label metadata set");
   } else {
       for (label of tkMetadataElements) { // for each tklabel element in tk.mds
         let tkLabelName = label.attributes.name.value; // Element name=""
         let attributes = label.querySelectorAll("[code=" + lang + "] Attribute"); // gets attributes for selected language
         let tkName = attributes[0].textContent; // name="label"
         let tkDefinition = attributes[1].textContent; // name="definition"
         let tkComment = attributes[2].textContent; // name="comment"
         addTKLabelToImage(tkLabelName, tkDefinition, tkName, tkComment);       
      }  
   }
}

function loadTKMetadataSetOld(lang) {
   tkMetadataSetStatus = "loading";
   $.ajax({
      url: gs.variables["tkMetadataURL"],
      success: function(xml) {
         tkMetadataSetStatus = "loaded";
         let parser = new DOMParser();
         let tkmds = parser.parseFromString(xml, "text/xml");
         tkMetadataElements = tkmds.querySelectorAll("Element");
         if (document.readyState === "complete") {
            addTKLabelsToImages(lang);
         } else {
            window.onload = function() {
               addTKLabelsToImages(lang);
            }
         }
      },
      error: function() {
         tkMetadataSetStatus = "no-metadata-set-for-this-collection";
         console.log("No TK Label Metadata-set found for this collection");
      }
   });
};
function loadTKMetadataSet(lang, type) {
    if (gs.variables["tkMetadataURL_"+type] == undefined) {
	console.error("tkMetadataURL_"+type+" variable is not defined, can't load TK Metadata Set");
	tkMetadataSetStatus = "no-metadata-set-for-this-"+type;
	return;
    }
    tkMetadataSetStatus = "loading";
   $.ajax({
       url: gs.variables["tkMetadataURL_"+type],
       async: false,
       success: function(xml) {
         tkMetadataSetStatus = "loaded";
         let parser = new DOMParser();
         let tkmds = parser.parseFromString(xml, "text/xml");
         tkMetadataElements = tkmds.querySelectorAll("Element");
           if (document.readyState === "complete") {
            addTKLabelsToImages(lang);
           } else {
               window.onload = function() {
               addTKLabelsToImages(lang);
            }
         }
      },
      error: function() {
          tkMetadataSetStatus = "no-metadata-set-for-this-"+type;
	  console.log("No TK Label Metadata-set found for this "+type);
      }
   });
};

// Audio Scripts for Enriched Playback

var wavesurfer;

function loadAudio(audio, sectionData) {
   let editMode = false;
   let currentRegion = {speaker: '', start: '', end: ''};
   let currentRegions = [];

   // let speakerObjects = [];
   // let tempSpeakerObjects = [];
   // let uniqueSpeakers;
   const inputFile = sectionData;
   let itemType;

   let dualMode = false;
   let secondaryLoaded = false;

   let waveformCursorX = 0;
   let snappedToX = 0;
   let snappedTo = "none";
   let cursorPos = 0;
   let ctrlDown = false;
   let mouseDown = false;
   let newRegionOffset = 0;

   let editsMade = false;
   let undoLevel = 0;
   let undoStates = [];
   let prevUndoState = "";
   let tempZoomSave = 0;
   let isZooming;

   let accentColour = "#66d640";
   // let accentColour = "#F8C537";
   let regionTransparency = "50";

   let waveformContainer = document.getElementById("waveform");
   
   wavesurfer = WaveSurfer.create({ // wavesurfer options
      container: waveformContainer,
      backend: "MediaElement",
      backgroundColor: "rgb(40, 54, 58)",
      // backgroundColor: "rgb(24, 36, 39)",
      waveColor: "white",
      progressColor: accentColour,
      // progressColor: "grey",
      // barWidth: 2,
      barHeight: 1.2,
      // barGap: 2,
      // barRadius: 1,
      cursorColor: 'black',
      cursorWidth: 2,
      normalize: true, // normalizes by maximum peak
      plugins: [
         WaveSurfer.regions.create({
            // formatTimeCallback: function(a, b) {
            //    return "TEST";
            // }
         }),
         WaveSurfer.timeline.create({
            container: "#wave-timeline",
            secondaryColor: "white",
            secondaryFontColor: "white",
            notchPercentHeight: "0",
            fontSize: "12"
         }),
         WaveSurfer.cursor.create({
            showTime: true,
            opacity: 1,
            customShowTimeStyle: {
                'background-color': '#000',
                color: '#fff',
                padding: '0.25rem',
                'font-size': '12px'
            },
            formatTimeCallback: (num) => { return formatCursor(num); }
         }),
      ],
   });

   wavesurfer.load(audio);

   // wavesurfer events

   wavesurfer.on('region-click', handleRegionClick);

   function handleRegionClick(region, e) { 
      contextMenu.classList.remove('visible');
      e.stopPropagation();
      if (!editMode) { // play region audio on click
         wavesurfer.play(region.start); // plays from start of region
      } else { // select or deselect current region
         // if (region.element.classList.contains("region-top")) caretClicked("primary-caret");
         // else if (region.element.classList.contains("region-bottom")) caretClicked("secondary-caret");
         if (region.element.classList.contains("region-top")) {
            currSpeakerSet = primarySet;
            swapCarets(true);
         } else if (region.element.classList.contains("region-bottom")) {
            currSpeakerSet = secondarySet;
            swapCarets(false);
         }
         prevUndoState = "";

         if (!e.ctrlKey && !e.shiftKey) {
            currentRegions = [];
            if (getCurrentRegionIndex() != -1 && isCurrentRegion(region)) {
               // removeCurrentRegion(); // deselect current region on click
            } else {
               currentRegion = region;
               currentRegion.speaker = currentRegion.attributes.label.innerHTML;
               region.play(); // start and stop to move play cursor to beginning of region
               wavesurfer.playPause();
            }
         } else if (e.ctrlKey) { // control was held during click
            if (currentRegions.length == 0 && isCurrentRegion(region)) {
               removeCurrentRegion();
            } else if (getCurrentRegionIndex() != -1 && isInCurrentRegions(region)) {
               const removeIndex = getIndexInCurrentRegions(region);
               if (removeIndex != -1) currentRegions.splice(removeIndex, 1);
               if (currentRegions.length > 0 && isCurrentRegion(region)) { // change current region if removed
                  currentRegion = currentRegions[0];
                  // currentRegions = [];
               }
            } else {
               if (currentRegions.length < 1) currentRegions.push(currentRegion);
               if (getIndexInCurrentRegions(region) == -1) currentRegions.push(region); // add if it doesn't already exist
               currentRegion = region;
               currentRegion.speaker = currentRegion.attributes.label.innerHTML;
               region.play();
               wavesurfer.playPause();
            }
            if (currentRegions.length == 1)  currentRegions = []; // clear selected regions if there is only one
         } else if (e.shiftKey) { // shift was held during click
            if (getCurrentRegionIndex() != -1 && getIndexOfRegion(region) != -1) {
               if (currentRegions && currentRegions.length > 0) {
                  if (Math.max(...getCurrentRegionsIndexes()) < getIndexOfRegion(region)) { // shifting forwards / down
                     currentRegions = currSpeakerSet.tempSpeakerObjects.slice(Math.min(...getCurrentRegionsIndexes()), getIndexOfRegion(region)+1);
                  } else { // shifting backwards / up
                     currentRegions = currSpeakerSet.tempSpeakerObjects.slice(getIndexOfRegion(region), Math.max(...getCurrentRegionsIndexes())+1);
                  }
               } else {
                  if (getCurrentRegionIndex() < getIndexOfRegion(region)) { // shifting forwards / down
                     currentRegions = currSpeakerSet.tempSpeakerObjects.slice(getCurrentRegionIndex(), getIndexOfRegion(region)+1);
                  } else { // shifting backwards / up
                     currentRegions = currSpeakerSet.tempSpeakerObjects.slice(getIndexOfRegion(region), getCurrentRegionIndex()+1);
                  }
               }
            }
         }
         if (changeAllCheckbox.checked) { currentRegions = getRegionsWithSpeaker(currentRegion.speaker) } 
         reloadRegionsAndChapters();
      }
   }

   function getIndexInCurrentRegions(region) {
      for (const reg of currentRegions) {
         const regSpeaker = reg.attributes ? reg.attributes.label.innerHTML : reg.speaker;
         if (reg.start == region.start && reg.end == region.end && regSpeaker == region.attributes.label.innerHTML) {
            return currentRegions.indexOf(reg);
         }
      }
      return -1;
   }

   function getIndexOfRegion(region) {
      for (const reg of currSpeakerSet.tempSpeakerObjects) {
         if (reg.start == region.start && reg.end == region.end && reg.speaker == region.attributes.label.innerHTML) {
            return currSpeakerSet.tempSpeakerObjects.indexOf(reg);
         }
      }
      return -1;
   }

   wavesurfer.on('region-mouseenter', function(region) { // region hover effects
      if (!mouseDown) {
         handleRegionColours(region, true); 
         hoverSpeaker.innerHTML = region.attributes.label.innerHTML;  
         hoverSpeaker.style.marginLeft = parseInt(region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
         if (!isInCurrentRegions(region)) {
            removeRegionBounds();
            drawRegionBounds(region, waveform.scrollLeft, "black");
         }
         if (isCurrentRegion(region) && editMode) drawRegionBounds(region, waveform.scrollLeft, "FireBrick");
      }
   });
   wavesurfer.on('region-mouseleave', function(region) { 
      if (!mouseDown) {
         if (!(wavesurfer.getCurrentTime() <= region.end && wavesurfer.getCurrentTime() >= region.start)) handleRegionColours(region, false); 
         if (!editMode) hoverSpeaker.innerHTML = "";
         removeRegionBounds();
         if (currentRegion.speaker && getCurrentRegionIndex() != -1) { 
            hoverSpeaker.innerHTML = currentRegion.speaker;
            hoverSpeaker.style.marginLeft = parseInt(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
            drawCurrentRegionBounds();
         } 
         // if (!currentRegion.speaker || !regionsMatch(region, currentRegion)) hoverSpeaker.innerHTML = "";
      }
   });
   wavesurfer.on('region-in', function(region) { 
      handleRegionColours(region, true); 
      if (itemType == "chapter") {
         document.getElementById("chapter" + region.id.replace("region", "")).scrollIntoView({
            behavior: "smooth",
            block: "nearest"
         });
      }
   });
   wavesurfer.on('region-out', function(region) { handleRegionColours(region, false) });
   wavesurfer.on('region-update-end', handleRegionEdit); // end of click-drag event
   wavesurfer.on('region-updated', handleRegionSnap);

   let loader = document.createElement("span"); // loading audio element
   loader.innerHTML = "Loading audio";
   loader.id = "waveform-loader";
   document.querySelector("#waveform wave").prepend(loader);

   wavesurfer.on('waveform-ready', function() { // retrieve regions once waveforms have loaded
      if (inputFile.endsWith("csv")) { // diarization if csv
         itemType = "chapter";
         if (localStorage.getItem('undoStates') && localStorage.getItem('undoLevel')) {
            console.log('-- Loading regions from localStorage --');
            undoStates = JSON.parse(localStorage.getItem('undoStates'));
            undoLevel = JSON.parse(localStorage.getItem('undoLevel'));
            primarySet.tempSpeakerObjects = undoStates[undoLevel].state;
            primarySet.uniqueSpeakers = [];
            for (const item of primarySet.tempSpeakerObjects) {
               if (!primarySet.uniqueSpeakers.includes(item.speaker)) primarySet.uniqueSpeakers.push(item.speaker);
            }
            populateChapters(primarySet);
            if (undoStates[undoLevel].secState && undoStates[undoLevel].secState.length > 0) {
               secondarySet.tempSpeakerObjects = undoStates[undoLevel].secState;
               secondarySet.uniqueSpeakers = [];
               for (const item of secondarySet.tempSpeakerObjects) {
                  if (!secondarySet.uniqueSpeakers.includes(item.speaker)) secondarySet.uniqueSpeakers.push(item.speaker);
               }
               secondaryLoaded = true;
               editButton.click(); // open edit panel and enable dual mode if secondary set was previously altered
               dualModeCheckbox.checked = true;
               dualModeChanged(true);
            }
            updateRegionEditPanel(); 
         } else {
            loadCSVFile(inputFile, ["speaker", "start", "end"], primarySet);
            dualModeCheckbox.checked = true;
            dualModeChanged(true);
            
            setTimeout(()=>{
               dualModeCheckbox.checked = false;
               dualModeChanged(true);
            }, 100)
            
            // reloadRegionsAndChapters();
         }
      } else if (inputFile.endsWith("json")) { // transcription if json
         itemType = "word";
         loadJSONFile(inputFile);
      } else {                      
         console.log("Filetype of " + inputFile + " not supported.")
      }
      
      loader.remove(); // remove load text
      chapters.style.cursor = "pointer"; // remove load cursor
      waveform.className = "audio-scroll";
      drawVersionNames(); // draw version names if editPanel is expanded
   });
   
   function downloadURI(loc, name) {
      let link = document.createElement("a");
      link.download = name;
      link.href = loc;
      link.click();
   }

   // toolbar elements & event handlers
   const audioContainer = document.getElementById("audioContainer");
   const dualModeCheckbox = document.getElementById("dual-mode-checkbox");
   const waveform = document.getElementsByTagName("wave")[0];
   const primaryCaret = document.getElementById("primary-caret");
   const secondaryCaret = document.getElementById("secondary-caret");
   const chapters = document.getElementById("chapters");
   const editPanel = document.getElementById("edit-panel");
   const chapterButton = document.getElementById("chapterButton");
   const zoomOutButton = document.getElementById("zoomOutButton");
   const zoomSlider = document.getElementById("zoom-slider");
   const zoomInButton = document.getElementById("zoomInButton");
   const backButton = document.getElementById("backButton");
   const playPauseButton = document.getElementById("playPauseButton");
   const forwardButton = document.getElementById("forwardButton");
   const editButton = document.getElementById("editorModeButton");
   const downloadButton = document.getElementById("downloadButton");
   const muteButton = document.getElementById("muteButton");
   const volumeSlider = document.getElementById("volume-slider");
   const fullscreenButton = document.getElementById("fullscreenButton");
   const changeAllCheckbox = document.getElementById("change-all-checkbox");
   const changeAllLabel = document.getElementById("change-all-label");
   const speakerInput = document.getElementById("speaker-input");
   const startTimeInput = document.getElementById("start-time-input");
   const endTimeInput = document.getElementById("end-time-input");
   const removeButton = document.getElementById("remove-button");
   const createButton = document.getElementById("create-button");
   const discardButton = document.getElementById("discard-button");
   const undoButton = document.getElementById("undo-button");
   const redoButton = document.getElementById("redo-button");
   const saveButton = document.getElementById("save-button");
   const hoverSpeaker = document.getElementById("hover-speaker");
   const contextMenu = document.getElementById("context-menu");
   const contextDelete = document.getElementById("context-menu-delete");
   const contextReplace = document.getElementById("context-menu-replace");
   const contextOverdub = document.getElementById("context-menu-overdub");
   // const contextCopy = document.getElementById("context-menu-copy");
   const contextSave = document.getElementById("context-menu-save");
   const dualModeMenuButton = document.getElementById("dual-mode-menu-button");
   const dualModeMenu = document.getElementById("dual-mode-menu");

   audioContainer.addEventListener('fullscreenchange', (e) => { fullscreenChanged() });
   audioContainer.addEventListener('contextmenu', onRightClick);
   audioContainer.addEventListener("keyup", keyUp);
   audioContainer.addEventListener("keydown", keyDown);
   dualModeCheckbox.addEventListener("change", () => { dualModeChanged() });
   waveform.addEventListener('scroll', (e) => { waveformScrolled() })
   waveform.addEventListener('mousemove', (e) => waveformCursorX = e.x);
   primaryCaret.addEventListener("click", (e) => caretClicked(e.target.id));
   secondaryCaret.addEventListener("click", (e) => caretClicked(e.target.id));
   chapters.style.height = "0px";
   editPanel.style.height = "0px";
   chapterButton.addEventListener("click", () => { toggleChapters() });
   zoomOutButton.addEventListener("click", () => { zoomSlider.stepDown(); zoomSlider.dispatchEvent(new Event("input")) });
   zoomInButton.addEventListener("click", () => { zoomSlider.stepUp(); zoomSlider.dispatchEvent(new Event("input")) });
   backButton.addEventListener("click", () => { wavesurfer.skipBackward(); });
   playPauseButton.addEventListener("click", () => { wavesurfer.playPause() });
   forwardButton.addEventListener("click", () => { wavesurfer.skipForward(); });
   editButton.addEventListener("click", toggleEditMode); 
   downloadButton.addEventListener("click", () => { downloadURI(audio, audio.split(".dir/")[1]) }); 
   muteButton.addEventListener("click", () => { wavesurfer.toggleMute() });
   volumeSlider.style["accent-color"] = accentColour; 
   fullscreenButton.addEventListener("click", toggleFullscreen);
   zoomSlider.style["accent-color"] = accentColour; 
   changeAllCheckbox.addEventListener("change", () => { selectAllCheckboxChanged() });
   speakerInput.addEventListener("input", speakerChange);
   speakerInput.addEventListener("blur", speakerInputUnfocused);
   createButton.addEventListener("click", createNewRegion);
   removeButton.addEventListener("click", removeRegion);
   discardButton.addEventListener("click", discardRegionChanges);
   undoButton.addEventListener("click", undo);
   redoButton.addEventListener("click", redo);
   saveButton.addEventListener("click", saveRegionChanges);
   document.addEventListener('click', () => contextMenu.classList.remove('visible'));
   document.addEventListener('mouseup', () => mouseDown = false);
   document.addEventListener('mousedown', (e) => { if (e.target.id !== "create-button") newRegionOffset = 0 }); // resets new region offset on click
   document.querySelectorAll('input[type=number]').forEach(e => {
      e.onchange = (e) => { changeStartEndTime(e) }; // updates speaker objects when number input(s) are changed
      e.onblur = () => { prevUndoState = "" }; 
   }); 
   contextDelete.addEventListener("click", removeRightClicked);
   contextReplace.addEventListener("click", replaceSelected);
   contextOverdub.addEventListener("click", overdubSelected);
   // contextCopy.addEventListener("click", copySelected);
   contextSave.addEventListener("click", saveSelected);
   dualModeMenuButton.addEventListener("click", dualModeMenuToggle);
   dualModeMenuButton.addEventListener("click", dualModeMenuToggle);

   if (gs.variables.allowEditing === '0') { editButton.style.display = "none" }

   function dualModeMenuToggle() {
      if (editMode && dualMode) {
         if (dualModeMenu.classList.contains('visible')) dualModeMenu.classList.remove('visible');
         else dualModeMenu.classList.add('visible');
      }
   }

   function handleRegionSnap(region, e) {
      if (editMode && currentRegion) { 
         removeRegionBounds();
         hoverSpeaker.innerHTML = currentRegion.speaker;
         hoverSpeaker.style.marginLeft = parseInt(region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
         drawRegionBounds(region, waveform.scrollLeft, "FireBrick"); 
         if (e && e.action === "resize" && dualMode && editMode && !ctrlDown) { // won't actuate on drag
            let oppositeSet = secondarySet; // look down
            if (currSpeakerSet.isSecondary) oppositeSet = primarySet; // look up
            if (e.direction === "left") {
               region.update({ start: getSnapValue(region.start, oppositeSet.tempSpeakerObjects)});
            } else if (e.direction === "right") {
               region.update({ end: getSnapValue(region.end, oppositeSet.tempSpeakerObjects)});
            }
         }
         if (e && (e.action === "resize" || e.action === "drag")) {
            setInputInSeconds(startTimeInput, region.start);
            setInputInSeconds(endTimeInput, region.end);
         }
      }
   }

   function getSnapValue(newDragPos, speakerSet) { 
      const snapRadius = 1;      
      for (const region of speakerSet) { // scan opposite region for potential snapping points
         if (newDragPos > parseFloat(region.start) - snapRadius && newDragPos < parseFloat(region.start) + snapRadius) { 
            // console.log("snap to start: " + region.start); 
            snappedTo = "start";
            if (snappedToX == 0) snappedToX = waveformCursorX;
            return region.start; 
         }
         if (newDragPos > parseFloat(region.end) - snapRadius && newDragPos < parseFloat(region.end) + snapRadius) {
            // console.log("snap to end: " + region.end); 
            snappedTo = "end";
            if (snappedToX == 0) snappedToX = waveformCursorX;
            return region.end; 
         }

         if (snappedTo !== "none" && (waveformCursorX - snappedToX > 10 || waveformCursorX - snappedToX < -10)) {
            // console.log('released!');
            snappedTo = "none";
            snappedToX = 0;
            return cursorPos;
         }
      }
      return newDragPos;
   }

   function mmssToSeconds(input) {
      const arr = input.split(":");
      if (arr.length == 2) {
         return (parseInt(arr[0]) * 60) + parseInt(arr[1]);
      } else if (arr.length == 3) {
         return (parseInt(arr[0]) * 3600) + (parseInt(arr[1]) * 60) + parseInt(arr[2]);
      } else {
         console.error("unexpected input to mmssToSeconds: " + input);
      }
   }

   function removeRightClicked(e) {
      if (!e.target.classList.contains('faded')) {
         removeRegion();
      }
   }

   function replaceSelected(e) {
      if (!e.target.classList.contains('faded')) {
         let destinationSet = secondarySet; // replace down
         if (currSpeakerSet.isSecondary) destinationSet = primarySet; // replace up
         let currItems = [currentRegion];
         if (currentRegions && currentRegions.length > 0) currItems = currentRegions;
         for (let idx = 0; idx < currItems.length; idx++) { // handles both currentRegion and currentRegions
            for (let idy = 0; idy < destinationSet.tempSpeakerObjects.length; idy++) {
               const reg = destinationSet.tempSpeakerObjects[idy];
               if ((parseFloat(reg.start) >= parseFloat(currItems[idx].start) && parseFloat(reg.start) <= parseFloat(currItems[idx].end)) || 
                   (parseFloat(reg.start) <= parseFloat(currItems[idx].start) && parseFloat(reg.end) >= parseFloat(currItems[idx].start))) {
                  destinationSet.tempSpeakerObjects.splice(idy, 1); // remove subsequent region
                  idy--;
               }
            }
         }
         copySelected(e, true);
         reloadRegionsAndChapters();
         addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "replace", getCurrentRegionIndex());
      }
   }

   function containsRegion(set, region) {
      for (const item of set) {
         if (regionsMatch(region, item)) return true;
      }
      return false;
   }

   function overdubSelected(e) {
      if (!e.target.classList.contains('faded')) {
         let destinationSet = secondarySet; // replace down
         if (currSpeakerSet.isSecondary) destinationSet = primarySet; // replace up
         let backup;
         if (destinationSet.isSecondary) backup = cloneSpeakerObjectArray(primarySet.tempSpeakerObjects); // saves selected set as this process changes values in selected set (unknown reason)
         else backup = cloneSpeakerObjectArray(secondarySet.tempSpeakerObjects);
            copySelected(e, true);
         if (!currentRegions || currentRegions.length < 1) { // overdub single
            handleSameSpeakerOverlap(getCurrentRegionIndex(), destinationSet);
         } else { // overdub multiple
            for (const item of getCurrentRegionsIndexes().reverse()) { // reverse indexes so index doesn't break when regions are removed
               handleSameSpeakerOverlap(item, destinationSet);
            }
         }
         if (destinationSet.isSecondary) primarySet.tempSpeakerObjects = backup; 
         else secondarySet.tempSpeakerObjects = backup;
         addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "overdub", getCurrentRegionIndex());
         reloadRegionsAndChapters();
      }
   }

   function copySelected(e, skipUndoState) {
      if (!e.target.classList.contains('faded')) {
         let out = -1;
         let destinationSet = secondarySet; // copy down
         if (currSpeakerSet.isSecondary) { destinationSet = primarySet } // copy up
         if (currentRegions && currentRegions.length > 1) { // copy multiple
            const selectedRegion = currentRegion;
            const selectedRegions = currentRegions;
            destinationSet.tempSpeakerObjects.push(...selectedRegions);
            currSpeakerSet.isSecondary ? caretClicked("primary-caret") : caretClicked("secondary-caret"); // swap selected speakerSet (clears current regions)
            for (const reg of destinationSet.tempSpeakerObjects) { // restore currentRegions in dest. set
               for (const selReg of selectedRegions) {
                  if (regionsMatch(reg, selReg) && !containsRegion(currentRegions, reg)) { 
                     currentRegions.push(reg);
                  }
               }
               if (regionsMatch(reg, selectedRegion)) { currentRegion = reg; }
            }
         } else { // copy singular
            const selectedRegion = currentRegion; // copy currRegion as caretClicked wipes it
            destinationSet.tempSpeakerObjects.push(selectedRegion); // append current region to dest. set
            currSpeakerSet.isSecondary ? caretClicked("primary-caret") : caretClicked("secondary-caret"); // swap selected speakerSet (clears current regions)
            for (const reg of destinationSet.tempSpeakerObjects) { // restore currentRegion in dest. set
               if (regionsMatch(reg, selectedRegion)) { 
                  currentRegion = reg; 
                  break; 
               }
            }
         }
         reloadRegionsAndChapters();
         if (!skipUndoState) addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "copy", getCurrentRegionIndex());
      }
   }

   function onRightClick(e) {
      if (e.target.classList.contains("wavesurfer-region") && editMode) {
         e.preventDefault();
         contextMenu.classList.add("visible");
         if (e.clientX + 200 > $(window).width()) contextMenu.style.left = ($(window).width() - 220) + "px"; // ensure menu doesn't clip on right
         else contextMenu.style.left = e.clientX + "px";
         contextMenu.style.top = e.clientY + "px";

         if (dualMode && currentRegion && currentRegion.speaker !== "") {
            contextReplace.classList.remove('faded');
            contextOverdub.classList.remove('faded');
            // contextCopy.classList.remove('faded');
         } else {
            contextDelete.classList.add('faded');
            contextReplace.classList.add('faded');
            contextOverdub.classList.add('faded');
            // contextCopy.classList.add('faded');
         }
         if (currentRegion && currentRegion.speaker !== "") contextDelete.classList.remove('faded');
         if (dualMode) { // manipulate context texts
            const actionDirection = currSpeakerSet.isSecondary ? "Up" : "Down";
            contextReplace.innerHTML = "Replace Selected " + actionDirection;
            contextOverdub.innerHTML = "Overdub Selected " + actionDirection;
            // contextCopy.innerHTML = "Copy Selected " + actionDirection;
         } 
      }
   }

   function saveSelected(e) {
      let csvContent = "data:text/csv;charset=utf-8," + currSpeakerSet.speakerObjects.map(item => "\n" + [item.speaker, item.start, item.end].join());
      console.log(csvContent);
      var encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
   }

   function keyUp(e) {
      if (e.key == "Control") ctrlDown = false;
      if (e.target.tagName !== "INPUT") {
         if (e.code === "Backspace" || e.code === "Delete") removeRegion();
         else if (e.code === "Space") wavesurfer.playPause();
         else if (e.code === "ArrowLeft") wavesurfer.skipBackward();
         else if (e.code === "ArrowRight") wavesurfer.skipForward();
      }
      if (e.code == "KeyZ" && e.ctrlKey) undo();
      else if (e.code == "KeyY" && e.ctrlKey) redo();
   }

   function keyDown(e) {
      if (e.key == "Control") ctrlDown = true;
   }

   function dualModeChanged(skipUndoState) { // on dualmode checkbox value change
      dualMode = dualModeCheckbox.checked; 
      currSpeakerSet = primarySet;
      // removeCurrentRegion();
      if (!dualMode) removeCurrentRegion();
      reloadRegionsAndChapters();
      if (dualMode) {
         dualModeMenuButton.classList.add('visible');
         if (!secondaryLoaded) {
            loadCSVFile(inputFile.replace(".csv", "-2.csv"), ["speaker", "start", "end"], secondarySet);
            secondaryLoaded = true; // ensure secondarySet doesn't get re-read > once
         }
         document.getElementById("caret-container").style.display = "flex";
      } else {
         dualModeMenuButton.classList.remove('visible');
         caretClicked('primary-caret');
         document.getElementById("caret-container").style.display = "none";
      }
      currSpeakerSet = primarySet;
      drawVersionNames();
      if (!skipUndoState) addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "dualModeChange", getCurrentRegionIndex());
   } 

   // path to toolbar images
   let interface_bootstrap_images = "interfaces/" + gs.xsltParams.interface_name + "/images/bootstrap/";

   function caretClicked(id) {
      if (id === "primary-caret") {
         currSpeakerSet = primarySet;
         swapCarets(true);
      } else if (id === "secondary-caret") {
         currSpeakerSet = secondarySet;
         swapCarets(false);
      }
   }

   function swapCarets(toPrimary) {
      const currCaretIsPrimary = primaryCaret.src.includes("fill") ? true : false;
      if ((toPrimary && !currCaretIsPrimary) || (!toPrimary && currCaretIsPrimary)) { 
         removeCurrentRegion(); // ensure currentRegion is only removed if changing speakerSet
         flashChapters(); 
      } 
      if (toPrimary) {
         primaryCaret.src = interface_bootstrap_images + "caret-right-fill.svg";
         secondaryCaret.src = interface_bootstrap_images + "caret-right.svg";
      } else {
         primaryCaret.src = interface_bootstrap_images + "caret-right.svg";
         secondaryCaret.src = interface_bootstrap_images + "caret-right-fill.svg";
      }
   }

   wavesurfer.on("play", () => { playPauseButton.src = interface_bootstrap_images + "pause.svg"; });
   wavesurfer.on("pause", () => { playPauseButton.src = interface_bootstrap_images + "play.svg"; });
   wavesurfer.on("mute", function(mute) { 
      if (mute) {
         muteButton.src = interface_bootstrap_images + "mute.svg"; 
         muteButton.style.opacity = 0.6;
         volumeSlider.value = 0;
      }
      else {
         muteButton.src = interface_bootstrap_images + "unmute.svg"; 
         muteButton.style.opacity = 1;
         volumeSlider.value = 1;
      } 
   });

   volumeSlider.addEventListener("input", function() {
      wavesurfer.setVolume(this.value);
      if (this.value == 0) {
         muteButton.src = interface_bootstrap_images + "mute.svg"; 
         muteButton.style.opacity = 0.6;
      } else {
         muteButton.src = interface_bootstrap_images + "unmute.svg"; 
         muteButton.style.opacity = 1;
      }
   });

   zoomSlider.addEventListener("input", function() { // slider changes waveform zoom
      wavesurfer.zoom(Number(this.value) / 4); 
      if (currentRegion.speaker && getCurrentRegionIndex() != -1) { 
         hoverSpeaker.innerHTML = currentRegion.speaker;
         hoverSpeaker.style.marginLeft = parseInt(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
         drawCurrentRegionBounds();
      }
      let handles = document.getElementsByClassName("wavesurfer-handle");
      if (this.value < 20) {
         for (const handle of handles) {
            handle.style.setProperty("width", "1px", "important");
         }
      } else {
         for (const handle of handles) {
            handle.style.setProperty("width", "3px", "important");
         }
      }
   });
   wavesurfer.zoom(zoomSlider.value / 4); // set default zoom point

   let toggleChapters = function() { // show & hide chapter section
      if (chapters.style.height == "0px") {
         chapters.style.height = "30vh";
      } else {
         chapters.style.height = "0px";
      }
   }

   function SpeakerSet(isSecondary, uniqueSpeakers, speakerObjects, tempSpeakerObjects) {
      this.isSecondary = isSecondary;
      this.uniqueSpeakers = uniqueSpeakers;
      this.speakerObjects = speakerObjects;
      this.tempSpeakerObjects = tempSpeakerObjects;
   }
   let primarySet = new SpeakerSet(false, [], [], []);
   let secondarySet = new SpeakerSet(true, [], [], []);
   let currSpeakerSet = primarySet;

   function loadCSVFile(filename, manualHeader, speakerSet) { // based on: https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
      // if (speakerSet) currSpeakerSet = speakerSet; // if parameter is given, set
      $.ajax({
         type: "GET",
         url: filename,
         dataType: "text",
      }).then(function(data) {
         let dataLines = data.split(/\r\n|\n/);
         let headers;
         let startIndex;
         speakerSet.uniqueSpeakers = []; // used for obtaining unique colours
         speakerSet.speakerObjects = []; // list of speaker items

         if (manualHeader) { // headers for columns can be provided if not existent in csv
            headers = manualHeader;
            startIndex = 0;
         } else {
            headers = dataLines[0].split(',');
            startIndex = 1;
         }

         for (let i = startIndex; i < dataLines.length; i++) {
            let data = dataLines[i].split(',');
            if (data.length == headers.length) {
               let item = {};
               for (let j = 0; j < headers.length; j++) {
                  item[headers[j]] = data[j];
                  if (j == 0 && !speakerSet.uniqueSpeakers.includes(data[j])) {
                     speakerSet.uniqueSpeakers.push(data[j]);
                  }
               }
               speakerSet.speakerObjects.push(item);
            }
         }
         speakerSet.tempSpeakerObjects = cloneSpeakerObjectArray(speakerSet.speakerObjects);
         populateChapters(speakerSet);
         resetUndoStates(); // undo stack init
      });
   }

   function populateChapters(data) { // populates chapter section and adds regions to waveform
      // colorbrewer is a web tool for guidance in choosing map colour schemes based on a letiety of settings.
      // this colour scheme is designed for qualitative data
      // console.log('populateChapters...') // CLG
      if (data.uniqueSpeakers.length > 8) colourbrewerset = colorbrewer.Set2[8];
      else if (data.uniqueSpeakers.length < 3) colourbrewerset = colorbrewer.Set2[3];
      else  colourbrewerset = colorbrewer.Set2[data.uniqueSpeakers.length];

      let isSelectedSet = false;

      if ((!data.isSecondary && primaryCaret.src.includes("fill")) || (data.isSecondary && secondaryCaret.src.includes("fill"))) isSelectedSet = true;
      if (isSelectedSet || !dualMode) chapters.innerHTML = ""; // clear chapter div for re-population
      data.tempSpeakerObjects = sortSpeakerObjectsByStart(data.tempSpeakerObjects); // sort speakerObjects by start time

      for (let i = 0; i < data.tempSpeakerObjects.length; i++) {
         let chapter = document.createElement("div"); 
         chapter.classList.add("chapter");
         chapter.id = "chapter" + i;
         let speakerName = document.createElement("span");
         speakerName.classList.add("speakerName");
         speakerName.innerHTML = data.tempSpeakerObjects[i].speaker;
         let speakerTime = document.createElement("span"); 
         speakerTime.classList.add("speakerTime"); 
         speakerTime.innerHTML = minutize(data.tempSpeakerObjects[i].start) + " - " + minutize(data.tempSpeakerObjects[i].end) + "s";
         chapter.appendChild(speakerName);
         chapter.appendChild(speakerTime);
         chapter.addEventListener("click", chapterClicked);
         chapter.addEventListener("mouseenter", e => { chapterEnter(Array.from(e.target.parentElement.children).indexOf(e.target)) });
         chapter.addEventListener("mouseleave", e => { chapterLeave(Array.from(e.target.parentElement.children).indexOf(e.target)) });

         let selected = false;
         let dummyRegion = { start: data.tempSpeakerObjects[i].start, end: data.tempSpeakerObjects[i].end };

         if ((isSelectedSet || !dualMode) && (isCurrentRegion(dummyRegion) || isInCurrentRegions(dummyRegion))) {
            chapter.classList.add("selected-chapter");
            selected = true;
         }

         if (isSelectedSet || !dualMode) chapters.appendChild(chapter);

         let associatedReg = wavesurfer.addRegion({ // create associated wavesurfer region
            id: "region" + i,
            start: data.tempSpeakerObjects[i].start,
            end: data.tempSpeakerObjects[i].end,
            drag: editMode,
            resize: editMode,
            attributes: {
               label: speakerName,
            },
            color: colourbrewerset[data.uniqueSpeakers.indexOf(data.tempSpeakerObjects[i].speaker)%8] + regionTransparency,
            ...(selected) && {color: "rgba(255,50,50,0.5)"},
         });
         data.tempSpeakerObjects[i].region = associatedReg;
      }

      let handles = document.getElementsByTagName('handle');
      for (const handle of handles) handle.addEventListener('mousedown', () => mouseDown = true);

      let regions = document.getElementsByTagName("region");
      if (dualMode) {
         if (document.getElementsByClassName("region-top").length === 0) for (const reg of regions) reg.classList.add("region-top"); 
         else for (const rego of regions) if (!rego.classList.contains("region-top")) rego.classList.add("region-bottom");
      }
      if (editMode) for (const reg of regions) reg.style.setProperty("z-index", "3", "important");
      else for (const reg of regions) reg.style.setProperty("z-index", "1", "important");
   }

   function loadJSONFile(filename) {
      $.ajax({
         type: "GET",
         url: filename,
         dataType: "text",
      }).then(function(data){ populateWords(JSON.parse(data)) });
   }

   function populateWords(data) { // populates word section and adds regions to waveform
      let transcription = data.transcription;
      let words = data.words;
      let wordContainer = document.createElement("div");
      wordContainer.id = "word-container";
      for (let i = 0; i < words.length; i++) {
         let word = document.createElement("span");
         word.id = "word" + i;
         word.classList.add("word");
         word.innerHTML = transcription.split(" ")[i];
         word.addEventListener("click", e => { wordClicked(data, e.target.id) });
         word.addEventListener("mouseover", e => { chapterEnter(Array.from(e.target.parentElement.children).indexOf(e.target)) });
         word.addEventListener("mouseleave", e => { chapterLeave(Array.from(e.target.parentElement.children).indexOf(e.target)) });
         wordContainer.appendChild(word);
         wavesurfer.addRegion({
            id: "region" + i,
            start: words[i].startTime,
            end: words[i].endTime,
            drag: false,
            resize: false,
            color: "rgba(255, 255, 255, 0.1)",
         });
      }
      chapters.appendChild(wordContainer);
   }

   let chapterClicked = function(e) { // plays audio from start of chapter
      const index = Array.from(chapters.children).indexOf(e.target);
      let clickedRegion = currSpeakerSet.tempSpeakerObjects[index].region;
      handleRegionClick(clickedRegion, e);
   }

   function wordClicked(data, id) { // plays audio from start of word
      let index = id.replace("word", "");
      let start = data.words[index].startTime;
      wavesurfer.play(start);
   }

   function chapterEnter(idx) {
      let reg = currSpeakerSet.tempSpeakerObjects[idx].region;
      regionEnter(reg);
      hoverSpeaker.innerHTML = reg.attributes.label.innerHTML;  
      hoverSpeaker.style.marginLeft = parseInt(reg.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
      if (!isInCurrentRegions(reg)) {
         removeRegionBounds();
         drawRegionBounds(reg, waveform.scrollLeft, "black");
      }
   }

   function chapterLeave(idx) {
      regionLeave(currSpeakerSet.tempSpeakerObjects[idx].region);
      removeRegionBounds();
      hoverSpeaker.innerHTML = "";
      if (currentRegion.speaker && getCurrentRegionIndex() != -1) { 
         hoverSpeaker.innerHTML = currentRegion.speaker;
         hoverSpeaker.style.marginLeft = parseInt(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
         drawCurrentRegionBounds();
      } 
   }

   function handleRegionColours(region, highlight) { // handles region, chapter & word colours
      if (!dualMode || (region.element.classList.contains("region-top") && primaryCaret.src.includes("fill")) || region.element.classList.contains("region-bottom") && secondaryCaret.src.includes("fill")) {
         let colour;
         if (highlight) {
            colour = "rgb(101, 116, 116)";
            regionEnter(region);
         } else {
            colour = "";
            regionLeave(region);
         }
         if (isCurrentRegion(region) || isInCurrentRegions(region)) {
            colour = "rgba(255, 50, 50, 0.5)";
         }
         let regionIndex = region.id.replace("region","");
         let corrItem = document.getElementById(itemType + regionIndex);
         corrItem.style.backgroundColor = colour; // updates chapter background (not region)
      }
   }

   function regionEnter(region) {
      // console.log("regionEnter");
      if (isCurrentRegion(region) || isInCurrentRegions(region)) {
         region.update({ color: "rgba(255, 50, 50, 0.5)" });
      } else {
         region.update({ color: "rgba(255, 255, 255, 0.35)" });
      }
   }

   function regionLeave(region) { 
      // console.log("regionLeave");
      if (itemType == "chapter") {
         if (isCurrentRegion(region) || isInCurrentRegions(region)) {
            region.update({ color: "rgba(255, 50, 50, 0.5)" });
         } else if (!(wavesurfer.getCurrentTime() + 0.1 < region.end && wavesurfer.getCurrentTime() > region.start)) {
            let index = region.id.replace("region", "");
            region.update({ color: colourbrewerset[currSpeakerSet.uniqueSpeakers.indexOf(currSpeakerSet.tempSpeakerObjects[index].speaker)%8] + regionTransparency });
         }
      } else {
         region.update({ color: "rgba(255, 255, 255, 0.1)" });
      }
   }

   function minutize(num) { // converts seconds to m:ss for chapters & waveform hover
      let date = new Date(null);
      date.setSeconds(num);
      return date.toTimeString().split(" ")[0].substring(3);
   }

   function formatCursor(num) {
      cursorPos = num;
      return minutize(num);
   }

   function getLetter(val) {
      // return val.replace("SPEAKER_","");
      let speakerNum = parseInt(val.replace("SPEAKER_",""));
      return String.fromCharCode(65 + speakerNum); // 'A' == UTF-16 65
   }



   // edit functionality

   function toggleEditMode() { // toggles edit panel and redraws regions with resize handles
      if (gs.variables.allowEditing === '1') {
         if (dualMode) dualModeCheckbox.click(); // dual mode is disabled when leaving edit mode
         toggleEditPanel();
         updateRegionEditPanel();
         drawVersionNames();
      }
   }

   function drawVersionNames() { 
      if (document.getElementById("prim-set-label")) document.getElementById("prim-set-label").remove();
      if (document.getElementById("sec-set-label")) document.getElementById("sec-set-label").remove();
      if (editMode && !document.body.contains(loader)) { // editmode is opposite here
         let dataLabel = document.createElement("span");
         dataLabel.textContent = "Bella A V1.0";
         dataLabel.id = "prim-set-label";
         waveform.append(dataLabel);
         if (dualMode) {
            let dataLabel = document.createElement("span");
            dataLabel.textContent = "Bella A V2.0";
            dataLabel.id = "sec-set-label";
            waveform.append(dataLabel);
         } 
      } 
   }

   function toggleEditPanel() { // show & hide edit panel
      removeCurrentRegion();
      hoverSpeaker.innerHTML = "";
      if (editPanel.style.height == "0px") {
         if (chapters.style.height == "0px") chapters.style.height = "30vh"; // expands chapter panel
         editPanel.style.height = "30vh";
         editPanel.style.padding = "1rem";
         setRegionEditMode(true);
      } else { 
         editPanel.style.height = "0px"; 
         editPanel.style.padding = "0px"; 
         setRegionEditMode(false);
      }
   }

   function setRegionEditMode(state) {
      editMode = state;
      chapters.innerHTML = '';
      wavesurfer.clearRegions();
      populateChapters(currSpeakerSet);
   }

   function handleRegionEdit(region, e) { 
      if (region.element.classList.contains("region-bottom")) { currSpeakerSet = secondarySet; swapCarets(false) }
      else { currSpeakerSet = primarySet; swapCarets(true) }
      editsMade = true;
      currentRegion = region;
      region.play();
      wavesurfer.pause();
      let regionIndex = getCurrentRegionIndex();
      currentRegion.speaker = currSpeakerSet.tempSpeakerObjects[regionIndex].speaker;
      currSpeakerSet.tempSpeakerObjects[regionIndex].region = region;
      currSpeakerSet.tempSpeakerObjects[regionIndex].start = region.start;
      currSpeakerSet.tempSpeakerObjects[regionIndex].end = region.end;

      const chaps = chapters.childNodes; // chapter list
      chaps[regionIndex].childNodes[1].textContent = minutize(region.start) + " - " + minutize(region.end) + "s"; // update chapter item time
      currSpeakerSet.tempSpeakerObjects[regionIndex].region.update({start: region.start, end: region.end}); // update start/end

      handleSameSpeakerOverlap(getCurrentRegionIndex(), currSpeakerSet); // recalculate index in case start pos has changed
      addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "dragdrop", getCurrentRegionIndex());
      editPanel.click(); // fixes buttons needing to be clicked twice (unknown cause!)
   }

   function handleSameSpeakerOverlap(regionIdx, speakerSet) { // consumes/merges same-speaker regions with overlapping bounds
      let draggedRegion = speakerSet.tempSpeakerObjects[regionIdx]; // regionIdx may point to a different region within the for-loop after adjustments, so defined here
      let draggedRegionSpeaker = draggedRegion.speaker;
      for (let i = 0; i < speakerSet.tempSpeakerObjects.length; i++) {
         if (speakerSet.tempSpeakerObjects[i].speaker === draggedRegionSpeaker && !regionsMatch(draggedRegion, speakerSet.tempSpeakerObjects[i])) { // ensure speaker name match
            if (parseFloat(speakerSet.tempSpeakerObjects[i].start) <= parseFloat(draggedRegion.end) && parseFloat(draggedRegion.start) <= parseFloat(speakerSet.tempSpeakerObjects[i].end)) { // ensure overlap
               draggedRegion.start = Math.min(speakerSet.tempSpeakerObjects[i].start, draggedRegion.start);
               draggedRegion.end = Math.max(speakerSet.tempSpeakerObjects[i].end, draggedRegion.end);
               draggedRegion.region.update({start: Math.min(speakerSet.tempSpeakerObjects[i].start, draggedRegion.start), end: Math.max(speakerSet.tempSpeakerObjects[i].end, draggedRegion.end)});
               currentRegion = draggedRegion;
               speakerSet.tempSpeakerObjects[i].region.remove();
               speakerSet.tempSpeakerObjects.splice(i, 1); // remove consumed region
               setInputInSeconds(startTimeInput, draggedRegion.region.start); // update number inputs
               setInputInSeconds(endTimeInput, draggedRegion.region.end);
               i = -1; // reset for loop to support multiple consumptions
            }
         }
      }
      for (let i = 0; i < speakerSet.tempSpeakerObjects.length; i++) { // remove duplicates
         if (speakerSet.tempSpeakerObjects[i] && speakerSet.tempSpeakerObjects[i+1]) {
            if (regionsMatch(speakerSet.tempSpeakerObjects[i], speakerSet.tempSpeakerObjects[i+1])) {
               speakerSet.tempSpeakerObjects[i+1].region.remove();
               speakerSet.tempSpeakerObjects.splice(i+1, 1); // remove consumed region
               i--;
            }
         }
      }
   }

   function updateRegionEditPanel() { // updates edit panel content/inputs
      // console.log('updating regionEditPanel')
      if (currentRegion && currentRegion.speaker == "") { 
         removeButton.classList.add("disabled");
         speakerInput.classList.add("disabled");
         changeAllCheckbox.classList.add("disabled");
         changeAllCheckbox.disabled = true;
         disableStartEndInputs();
         speakerInput.readOnly = true;
         speakerInput.value = "";
      } else { 
         removeButton.classList.remove("disabled");
         speakerInput.classList.remove("disabled");
         changeAllCheckbox.classList.remove("disabled");
         if (!isZooming) changeAllCheckbox.disabled = false; 
         enableStartEndInputs();
         speakerInput.readOnly = false;
      }
      if (editsMade) {
         discardButton.classList.remove("disabled");
         saveButton.classList.remove("disabled");
      } else {
         discardButton.classList.add("disabled");
         saveButton.classList.add("disabled");
      }
      if (changeAllCheckbox.checked) {
         // changeAllLabel.innerHTML = "Change all (x" + currentRegions.length + ")";
         disableStartEndInputs();
      }
      if (currentRegion && currentRegion.speaker != "") {
         speakerInput.value = currentRegion.speaker;
         setInputInSeconds(startTimeInput, currentRegion.start);
         setInputInSeconds(endTimeInput, currentRegion.end);
      }
      if (undoLevel - 1 < 0) undoButton.classList.add("disabled");
      else undoButton.classList.remove("disabled");
      if (undoLevel + 1 >= undoStates.length) redoButton.classList.add("disabled");
      else redoButton.classList.remove("disabled");
   }

   function createNewRegion() { // adds a new region to the waveform
      const speaker = "NEW_SPEAKER"; // default name
      if (!currSpeakerSet.uniqueSpeakers.includes(speaker)) { currSpeakerSet.uniqueSpeakers.push(speaker) }
      const start = newRegionOffset + wavesurfer.getCurrentTime();
      const end = newRegionOffset + wavesurfer.getCurrentTime() + 15;
      newRegionOffset += 5; // offset new region if multiple new regions are created. TODO: check region has different start time
      currSpeakerSet.tempSpeakerObjects.push({speaker: speaker, start: start, end: end});

      editsMade = true;
      currentRegions = [];
      currentRegion = getRegionFromProps({speaker: speaker, start: start, end: end});
      reloadRegionsAndChapters();
      addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "create", getCurrentRegionIndex());
   }

   function getRegionFromProps(props, speakerSet) { // find region using speaker, start & end time
      if (!speakerSet) speakerSet = currSpeakerSet;
      for (let i = 0; i < speakerSet.tempSpeakerObjects.length; i++) {
         if (speakerSet.tempSpeakerObjects[i].speaker === props.speaker && speakerSet.tempSpeakerObjects[i].start === props.start && speakerSet.tempSpeakerObjects[i].end === props.end) {
            return speakerSet.tempSpeakerObjects[i];
         } 
      }
      console.log("getRegionFromProps failed to find matching region");
   }

   function removeRegion() { // removes currently selected region or regions
      if (!removeButton.classList.contains("disabled")) {
         if (getCurrentRegionIndex() != -1) { // if currentRegion has been set 
            let currentRegionIndex = getCurrentRegionIndex();
            let currentRegionIndexes = getCurrentRegionsIndexes();
            for (let i = 0; i < currSpeakerSet.tempSpeakerObjects.length; i++) {
               if (isCurrentRegion(currSpeakerSet.tempSpeakerObjects[i].region)) {
                  currSpeakerSet.tempSpeakerObjects[i].region.remove();
                  currSpeakerSet.tempSpeakerObjects.splice(i, 1); // remove from tempSpeakerObjects
                  editsMade = true;
                  if (i >= 0) i--; // decrement index for side-by-side regions
                  if (!changeAllCheckbox.checked && currentRegions.length < 1) {
                     removeCurrentRegion();
                     addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "remove", currentRegionIndex);
                     return; // jump out of for loop
                  }
               } else if (isInCurrentRegions(currSpeakerSet.tempSpeakerObjects[i])) { 
                  currSpeakerSet.tempSpeakerObjects[i].region.remove();
                  currSpeakerSet.tempSpeakerObjects.splice(i, 1);
                  if (i >= 0) i--;
               }
            }
            removeCurrentRegion();
            // reloadRegionsAndChapters();
            addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "remove", currentRegionIndex, currentRegionIndexes); // multiple regions removed
         } else { console.log("no region selected") }
      }
   }

   function regionsMatch(reg1, reg2) {
      if (reg1 && reg2 && reg1.start == reg2.start && reg1.end == reg2.end) return true;
      return false;
   }

   function isCurrentRegion(region) {
      if (regionsMatch(currentRegion, region)) return true;
      return false;
   }

   function isInCurrentRegions(region) {
      if (currentRegions != []) {
         for (let i = 0; i < currentRegions.length; i++) {
            if (currentRegions[i].start == region.start && currentRegions[i].end == region.end) {
               return true;
            }
         }
      }
      return false;
   }

   function getCurrentRegionIndex() { // returns the index of currently selected region
      for (let i = 0; i < currSpeakerSet.tempSpeakerObjects.length; i++) {
         if (isCurrentRegion(currSpeakerSet.tempSpeakerObjects[i].region)) { return i }
      }
      // if (dualMode) {
      //    for (let i = 0; i < secondarySet.tempSpeakerObjects.length; i++) {
      //       if (isCurrentRegion(secondarySet.tempSpeakerObjects[i].region)) { return i }
      //    }
      // }
      return -1;
   }

   function getCurrentRegionsIndexes() { // returns the indexes of currently selected regions
      let indexes = [];
      for (let i = 0; i < currSpeakerSet.tempSpeakerObjects.length; i++) {
         if (isInCurrentRegions(currSpeakerSet.tempSpeakerObjects[i].region)) { indexes.push(i) }
      }
      return indexes;
   }

   function removeCurrentRegion() { // removes current region, regions and bound markers
      currentRegion = {speaker: '', start: '', end: ''};
      currentRegions = [];
      removeRegionBounds();
      hoverSpeaker.innerHTML = "";
   }

   function getRegionsWithSpeaker(speaker) { // returns all regions with the given speaker name
      let out = [];
      for (let i = 0; i < currSpeakerSet.tempSpeakerObjects.length; i++) {
         if (currSpeakerSet.tempSpeakerObjects[i].speaker === speaker) { out.push(currSpeakerSet.tempSpeakerObjects[i]) }
      }
      return out;
   }

   function sortSpeakerObjectsByStart(speakerOb) { // sorts the speaker object array by start time
      return speakerOb.sort(function(a,b) {
         return a.start - b.start;
      });
   }

   function speakerChange() { // speaker input name onInput handler
      const newSpeaker = speakerInput.value;
      if (newSpeaker && newSpeaker != "") {
         speakerInput.style.outline = "2px solid transparent";
         if (getCurrentRegionIndex() != -1) { // if a region is selected
            const chaps = chapters.childNodes;
            if (!currSpeakerSet.uniqueSpeakers.includes(newSpeaker)) { currSpeakerSet.uniqueSpeakers.push(newSpeaker) }
            if (currentRegions && currentRegions.length < 1) {  // single change
               currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].speaker = newSpeaker; // update corrosponding speakerObject speaker
               currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.attributes.label.innerHTML = newSpeaker;
               chaps[getCurrentRegionIndex()].firstChild.textContent = newSpeaker; // update chapter text
            } else if (currentRegions && currentRegions.length > 1) { // multiple changes
               for (idx of getCurrentRegionsIndexes()) {
                  currSpeakerSet.tempSpeakerObjects[idx].speaker = newSpeaker;
                  currSpeakerSet.tempSpeakerObjects[idx].region.attributes.label.innerHTML = newSpeaker;
                  chaps[idx].firstChild.textContent = newSpeaker;
               }
            } 
            // speakerInput.value = "";
            currentRegion.speaker = newSpeaker;
            chapterLeave(getCurrentRegionIndex()); // update region bound text
            editsMade = true;
            // reloadRegionsAndChapters();
            addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "speaker-change", getCurrentRegionIndex(), getCurrentRegionsIndexes());
         } else { console.log("no region selected") }
      } else { console.log("no text in speaker input"); speakerInput.style.outline = "2px solid firebrick"; }
   }

   function speakerInputUnfocused() {
      prevUndoState = "";
      if (speakerInput.value == "" && !speakerInput.classList.contains("disabled")) {
         speakerInput.style.outline = "2px solid firebrick";
         window.alert("Speaker input cannot be left empty. Please enter a speaker name.");
         setTimeout(() => speakerInput.focus(), 10); // timeout needed otherwise input isn't selected
      } else speakerInput.style.outline = "2px transparent";
   }

   function selectAllCheckboxChanged(skipUndoState) { // "Change all" toggled
      if (changeAllCheckbox.checked) {
         if (!isZooming) {
            tempZoomSave = zoomSlider.value;
            zoomTo(0); // zoom out to encompass all selected regions
         }
         let uniqueSelectedSpeakers;
         if (currentRegions && currentRegions.length > 0) { // if more than one region selected
            uniqueSelectedSpeakers = [... new Set(currentRegions.map(a => a.speaker))]; // gets unique speakers in currentRegions
            uniqueSelectedSpeakers.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
         } else uniqueSelectedSpeakers = [currentRegion.speaker];
         currentRegions = [];
         for (const speaker of uniqueSelectedSpeakers) {
            for (const region of getRegionsWithSpeaker(speaker)) {
               currentRegions.push(region);
               region.region.update({color: "rgba(255,50,50,0.5)"});
            }
         }
      } else {
         if (!isZooming) {
            zoomTo(tempZoomSave / 4);  // zoom back in to previous level
         }
         currentRegions = []; // this will lose track of previously selected region*s*
         // changeAllLabel.innerHTML = "Change all";
         reloadRegionsAndChapters();
      }
      if (!skipUndoState) addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "selectAllChange", getCurrentRegionIndex(), getCurrentRegionsIndexes());
   }

   function enableStartEndInputs() { // removes the 'disabled' tag from all time inputs
      for (idx in startTimeInput.childNodes) { startTimeInput.childNodes[idx].disabled = false }
      for (idx in endTimeInput.childNodes) { endTimeInput.childNodes[idx].disabled = false }
   }

   function disableStartEndInputs() { // adds the 'disabled' tag to all time inputs
      for (idx in startTimeInput.childNodes) { startTimeInput.childNodes[idx].disabled = true; startTimeInput.childNodes[idx].value = 0; }
      for (idx in endTimeInput.childNodes) { endTimeInput.childNodes[idx].disabled = true; endTimeInput.childNodes[idx].value = 0; }
   }

   function zoomTo(dest) { // (smoothly?) zooms wavesurfer waveform to destination
      isZooming = true;
      changeAllCheckbox.disabled = true;
      let isOut = false;
      if (dest == 0) isOut = true;
      zoomInterval = setInterval(() => {
         if (isOut) {
            if (zoomSlider.value != 0) {
               if (zoomSlider.value > 50) zoomSlider.value -= 30; // ramp up for finer adjustments
               else zoomSlider.stepDown(); 
               wavesurfer.zoom(zoomSlider.value / 4); 
            } else {
               clearInterval(zoomInterval);
               isZooming = false;
               changeAllCheckbox.disabled = false;
               zoomSlider.dispatchEvent(new Event("input"));
            }
         } else {
            if (zoomSlider.value / 4 < dest) {
               if (zoomSlider.value > 50) zoomSlider.value += 30; // ramp up for finer adjustments
               else zoomSlider.stepUp(); 
               wavesurfer.zoom(zoomSlider.value / 4);
            } else {
               clearInterval(zoomInterval);
               isZooming = false;
               changeAllCheckbox.disabled = false;
               zoomSlider.dispatchEvent(new Event("input"));
            }
         }
      }, 10); // interval
      
   }

   function saveRegionChanges() { // saves tempSpeakerObjects to speakerObjects
      if (!saveButton.classList.contains("disabled")) {
         currSpeakerSet.speakerObjects = cloneSpeakerObjectArray(currSpeakerSet.tempSpeakerObjects);
         editsMade = false;
         removeCurrentRegion();
         reloadRegionsAndChapters();
         console.log("saved changes");
      }
   }

   function discardRegionChanges() { // resets tempSpeakerObjects to speakerObjects
      if (!discardButton.classList.contains("disabled")) {
         let confirm = window.confirm("Are you sure you want to discard changes?");
         if (confirm) {
            currSpeakerSet.tempSpeakerObjects = cloneSpeakerObjectArray(currSpeakerSet.speakerObjects);
            editsMade = false;
            removeCurrentRegion();
            resetUndoStates();
            reloadRegionsAndChapters();
            console.log("discarded changes");
         }
      }
   }

   function reloadRegionsAndChapters() { // redraws edit panel, chapter list, wavesurfer regions 
      updateRegionEditPanel();
      wavesurfer.clearRegions();
      $(".region-top").remove();
      $(".region-bottom").remove();
      $(".wavesurfer-region").remove();
      populateChapters(primarySet);
      if (dualMode) { 
         populateChapters(secondarySet);
         currSpeakerSet = primarySet;
      }
      updateCurrSpeakerSet();
      if (editMode && currentRegion && currentRegion.speaker && getCurrentRegionIndex() != -1) { 
         hoverSpeaker.innerHTML = currentRegion.speaker;
         hoverSpeaker.style.marginLeft = parseInt(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
         drawCurrentRegionBounds();
      }
      if (currentRegions.length < 1) { 
         removeButton.innerHTML = "Remove Selected Region";
         enableStartEndInputs();
      } else {
         removeButton.innerHTML = "Remove Selected Regions (x" + currentRegions.length + ")";
         disableStartEndInputs();
         const uniqueSelectedSpeakers = [... new Set(currentRegions.map(a => a.speaker))]; // gets unique speakers in currentRegions
         uniqueSelectedSpeakers.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
         speakerInput.value = uniqueSelectedSpeakers.join(", ");
      }
   }

   function changeStartEndTime(e) { // start/end time input handler
      let newStart = getTimeInSecondsFromInput(startTimeInput);
      let newEnd = getTimeInSecondsFromInput(endTimeInput);
      let duration = Math.floor(wavesurfer.getDuration()); // total duration of current audio
      if (getCurrentRegionIndex() != -1) { // if there is a selected region
         if (newEnd <= newStart) newStart = newEnd - 1; // when start time > end time, push region forward
         if (newEnd <= 0) newEnd = 1;
         if (newStart < 0) newStart = 0; // ensures region start doesn't go < 0s
         if (newEnd > duration) newEnd = duration; // ensures region start doesn't go > duration
         
         setInputInSeconds(startTimeInput, newStart);
         setInputInSeconds(endTimeInput, newEnd);

         let currRegIdx = getCurrentRegionIndex();
         currSpeakerSet.tempSpeakerObjects[currRegIdx].start = newStart;
         currSpeakerSet.tempSpeakerObjects[currRegIdx].end = newEnd;
         currSpeakerSet.tempSpeakerObjects[currRegIdx].region.update({start: newStart, end: newEnd});
         currentRegion.start = newStart;
         currentRegion.end = newEnd;
         editsMade = true;
         handleSameSpeakerOverlap(currRegIdx, currSpeakerSet);
         addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "change-time", getCurrentRegionIndex());
      } else { 
         console.log("no region selected");
         setInputInSeconds(startTimeInput, 0);
         setInputInSeconds(endTimeInput, 0);
      }
   }

   function getTimeInSecondsFromInput(input) { // returns time in seconds from start or end input
      let hours = input.children[0].valueAsNumber;
      let mins = input.children[1].valueAsNumber;
      let secs = input.children[2].valueAsNumber;
      return (hours * 3600) + (mins * 60) + secs;
   }

   function setInputInSeconds(input, seconds) { // sets start or end input time when given seconds
      let date = new Date(null);
      date.setMilliseconds(seconds * 1000);
      input.children[0].value = date.getHours() % 12;
      input.children[1].value = date.getMinutes();
      input.children[2].value = date.getSeconds() + "." + (Math.ceil(date.getMilliseconds() / 100) * 100);
      document.querySelectorAll('input[type=number]').forEach(e => {
         e.value = Math.round(e.valueAsNumber * 10) / 10; // to 1dp
         if (e.classList.contains("seconds") && !e.value.includes(".")) { e.value = e.value + ".0"; }
         else if (e.value.length === 1){ e.value = '0' + e.value; }// 0 padded on left
         // if (e.value.length === 3) {e.value = '0' + e.value ; console.log('3: ' + e.value)} // 0 on the left (doesn't work on FF)
      });      
   }

   function addUndoState(state, secState, isSec, dualMode, type, currRegIdx, currRegIdxs) { // adds a new state to the undoStates stack
      let newState = cloneSpeakerObjectArray(state.tempSpeakerObjects); // clone method removes references
      let newSecState = cloneSpeakerObjectArray(secState.tempSpeakerObjects); // clone method removes references
      undoButton.classList.remove("disabled");
      undoStates = undoStates.slice(0, undoLevel + 1); // trim to current level if undos have already been made
      undoStates.push({state: newState, secState: newSecState, isSec: isSec, dualMode: dualMode, currentRegionIndex: currRegIdx, currentRegionIndexes: currRegIdxs, type: type});
      if ((type === "change-time" && prevUndoState === "change-time") || (type === "speaker-change" && prevUndoState === "speaker-change")) { // checks if similar change was made previously
         undoStates.splice(-2, 1); // remove second-to-last item in undoStates stack (merge last two changes into one to avoid multiple small edits)
         prevUndoState = type;
      } else undoLevel++;
      prevUndoState = type;
      redoButton.classList.add("disabled");
      for (const item of undoStates) { // remove cyclic object references
         item.state = cloneSpeakerObjectArray(item.state);
         item.secState = cloneSpeakerObjectArray(item.secState);
      } 
      localStorage.setItem('undoStates', JSON.stringify(undoStates)); // update localStorage items
      localStorage.setItem('undoLevel', undoLevel);
   }

   function undo() { // undo action: go back one state in the undoStates stack
      if (!undoButton.classList.contains("disabled")) { // ensure there exist states to undo to
         if (undoLevel - 1 < 0) console.log("ran out of undos");
         else {            
            let adjustedUndoLevel = undoLevel-1;
            if (undoStates[undoLevel].type == "dualModeChange") { // toggle dual mode
               dualModeCheckbox.checked = !dualMode;
               dualModeChanged(true);
            } else if (undoStates[undoLevel].type == "selectAllChange") { // toggle select all
               changeAllCheckbox.checked = !changeAllCheckbox.checked;
               selectAllCheckboxChanged(true);
            } else {
               primarySet.tempSpeakerObjects = cloneSpeakerObjectArray(undoStates[adjustedUndoLevel].state.slice(0)); // slice & clone removes potential references between arrays
               if (dualMode && undoStates[adjustedUndoLevel].secState && undoStates[adjustedUndoLevel].secState.length > 0) { // if secondary undoState exists
                  secondarySet.tempSpeakerObjects = cloneSpeakerObjectArray(undoStates[adjustedUndoLevel].secState.slice(0)); // slice & clone removes potential references between arrays
               }
               let selectedSpeakerSet;
               // handle currentRegion change
               removeCurrentRegion();  
               if (undoStates[undoLevel] && undoStates[undoLevel].type && undoStates[undoLevel].type == "remove") { // if destination state type is remove
                  selectedSpeakerSet = (undoStates[undoLevel].isSec) ? secondarySet : primarySet;
                  if (selectedSpeakerSet.isSecondary) caretClicked("secondary-caret");
                  else caretClicked("primary-caret");
                  currentRegion = selectedSpeakerSet.tempSpeakerObjects[undoStates[undoLevel].currentRegionIndex]; // restore previous current state
                  // console.log("undo-ing to index " + undoStates[undoLevel].currentRegionIndex);
               } else if (undoStates[undoLevel].currentRegionIndex) {
                  if (!dualMode) selectedSpeakerSet = primarySet;
                  else {
                     selectedSpeakerSet = (undoStates[undoLevel-1].isSec) ? secondarySet : primarySet;
                     if (selectedSpeakerSet.isSecondary) caretClicked("secondary-caret");
                     else caretClicked("primary-caret");
                  }
                  currentRegion = selectedSpeakerSet.tempSpeakerObjects[undoStates[undoLevel].currentRegionIndex];
               } 
               // handle currentRegions change NEEDS REVISION xxxxx
               if (undoStates[undoLevel-1].currentRegionIndexes && undoStates[undoLevel-1].currentRegionIndexes.length > 1) {
                  for (const idx of undoStates[undoLevel-1].currentRegionIndexes) currentRegions.push(currSpeakerSet.tempSpeakerObjects[idx]);
               }
            }
            editsMade = true;
            
            undoLevel--; // decrement undoLevel
            reloadRegionsAndChapters();
            localStorage.setItem('undoLevel', undoLevel);
            if (undoLevel - 1 < 0) undoButton.classList.add("disabled");
            else undoButton.classList.remove("disabled");
         }
         if (undoLevel < undoStates.length) redoButton.classList.remove("disabled");
      }
   }

   function redo() { // redo action: go forward one state in the undoStates stack
      if (!redoButton.classList.contains("disabled")) { // ensure there exist states to redo to
         if (undoLevel + 1 >= undoStates.length) console.log("ran out of redos");
         else {
            if (undoStates[undoLevel+1].type == "dualModeChange") { // toggle dual mode
               dualModeCheckbox.checked = !dualMode;
               dualModeChanged(true);
            } else if (undoStates[undoLevel+1].type == "selectAllChange") { // toggle select all
               changeAllCheckbox.checked = !changeAllCheckbox.checked;
               selectAllCheckboxChanged(true);
            } else {
               primarySet.tempSpeakerObjects = cloneSpeakerObjectArray(undoStates[undoLevel+1].state.slice(0)); // set primary to new state
               secondarySet.tempSpeakerObjects = cloneSpeakerObjectArray(undoStates[undoLevel+1].secState.slice(0)); // set secondary to new state
               let selectedSpeakerSet;

               // handle currentRegion change
               removeCurrentRegion();
               if (undoLevel+2 < undoStates.length) {
                  if (undoStates[undoLevel+2] && undoStates[undoLevel+2].type && undoStates[undoLevel+2].type == "remove") {
                     selectedSpeakerSet = (undoStates[undoLevel+2].isSec) ? secondarySet : primarySet;
                     if (selectedSpeakerSet.isSecondary) caretClicked("secondary-caret"); 
                     else caretClicked("primary-caret");
                     currentRegion = selectedSpeakerSet.tempSpeakerObjects[undoStates[undoLevel+2].currentRegionIndex];
                  } else {
                     selectedSpeakerSet = (undoStates[undoLevel+1].isSec) ? secondarySet : primarySet;
                     if (selectedSpeakerSet.isSecondary) caretClicked("secondary-caret"); 
                     else caretClicked("primary-caret");
                     currentRegion = selectedSpeakerSet.tempSpeakerObjects[undoStates[undoLevel+1].currentRegionIndex];
                  }

                  // console.log("redo-ing to index " + undoStates[undoLevel+1].currentRegionIndex);
                  if (undoStates[undoLevel+1].currentRegionIndexes && undoStates[undoLevel+1].currentRegionIndexes.length > 1) {
                     for (const idx of undoStates[undoLevel-1].currentRegionIndexes) currentRegions.push(currSpeakerSet.tempSpeakerObjects[idx]);
                     // currentRegions = getRegionsWithSpeaker(currentRegion.speaker);
                     // if (!speakerCheckbox.checked) speakerCheckbox.click(); // ensures onchange event is fired
                  }
               }
            }
            editsMade = true;  
            
            
            reloadRegionsAndChapters();
            undoLevel++; // increment undoLevel
            localStorage.setItem('undoLevel', undoLevel);
            if (undoLevel + 1 > undoStates.length - 1) redoButton.classList.add("disabled");
            else redoButton.classList.remove("disabled");
         }
         if (undoLevel < undoStates.length) undoButton.classList.remove("disabled");
         // console.log("new undoLevel: " + undoLevel);
      }
   }

   function resetUndoStates() { // clear undo history
      // console.log('resetUndoStates')
      undoStates = [{state: cloneSpeakerObjectArray(primarySet.tempSpeakerObjects), secState: cloneSpeakerObjectArray(secondarySet.tempSpeakerObjects)}];
      undoLevel = 0;
      localStorage.removeItem('undoLevel');
      localStorage.removeItem('undoStates');
      undoButton.classList.add("disabled");
      redoButton.classList.add("disabled");
   }

   function waveformScrolled() { // waveform scroll handler
      if (currentRegion.speaker && getCurrentRegionIndex() != -1) { // updates region bound markers if selected region exists
         hoverSpeaker.innerHTML = currentRegion.speaker;
         hoverSpeaker.style.marginLeft = parseInt(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left.slice(0, -2)) - waveform.scrollLeft + "px";
         drawCurrentRegionBounds();
      }
   }

   function drawCurrentRegionBounds() {
      removeRegionBounds();
      if (editMode) {
         let currIndexes = getCurrentRegionsIndexes();
         if (getCurrentRegionIndex != 0) drawRegionBounds(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region, waveform.scrollLeft, "FireBrick");
         for (let i = 0; i < currIndexes.length; i++) {
            drawRegionBounds(currSpeakerSet.tempSpeakerObjects[currIndexes[i]].region, waveform.scrollLeft, "FireBrick");
         }
      }
   }

   function drawRegionBounds(region, scrollPos, colour) { // draws on canvas to show bounds of hovered/selected region
      const hoverSpeakerCanvas = document.createElement("canvas");
      hoverSpeakerCanvas.id = "hover-speaker-canvas";
      hoverSpeakerCanvas.classList.add("region-bounds");
      hoverSpeakerCanvas.width = audioContainer.clientWidth; // max width of drawn bounds
      const ctx = hoverSpeakerCanvas.getContext("2d");

      ctx.translate(0.5, 0.5); // fixes lineWidth inconsistency
      ctx.lineWidth = 1;
      if (colour == "FireBrick") ctx.lineWidth = 3;
      if (currentRegions && currentRegions.length < 1 && isCurrentRegion(region) && editMode) {
         colour = "FireBrick";
         ctx.lineWidth = 3;
      }
      ctx.strokeStyle = colour;
      ctx.beginPath();
      ctx.moveTo(parseInt(region.element.style.left.slice(0, -2)) - scrollPos, 28);
      ctx.lineTo(parseInt(region.element.style.left.slice(0, -2)) - scrollPos, 20);
      ctx.lineTo(parseInt(region.element.style.left.slice(0, -2)) + parseInt(region.element.style.width.slice(0, -2)) - scrollPos, 20);
      ctx.lineTo(parseInt(region.element.style.left.slice(0, -2)) + parseInt(region.element.style.width.slice(0, -2)) - scrollPos, 28);
      ctx.stroke();
      audioContainer.prepend(hoverSpeakerCanvas);
   }

   function removeRegionBounds() { // remove all region bound markers
      let canvases = document.getElementsByClassName('region-bounds');
      while (canvases[0]) canvases[0].parentNode.removeChild(canvases[0]);
   }

   function updateCurrSpeakerSet() {
      if (primaryCaret.src.includes("fill")) currSpeakerSet = primarySet;
      else if (secondaryCaret.src.includes("fill")) currSpeakerSet = secondarySet;
   }

   function cloneSpeakerObjectArray(inputArray) { // clones speakerObjectArray without references (wavesurfer regions)
      let output = [];
      for (let i = 0; i < inputArray.length; i++) { output.push({speaker: inputArray[i].speaker, start: inputArray[i].start, end: inputArray[i].end }) }
      return output;
   }

   function flashInput(valid) { // flashes background of input to show validity of input
      if (valid) speakerInput.style.backgroundColor = "rgb(50,255,50)"; 
      else speakerInput.style.backgroundColor = "rgb(255,50,50)";
      setTimeout(() => { speakerInput.style.backgroundColor = "rgb(255,255,255)" }, 750);
   }

   function flashChapters() {
      chapters.style.backgroundColor = "rgb(66, 84, 88)";
      setTimeout(() => { chapters.style.backgroundColor = "rgb(40, 54, 58)" }, 500);
   }

   function fullscreenChanged() { // fullscreen onChange handler, increases waveform height & adjusts padding/margin
      if (!audioContainer.classList.contains("fullscreen")) {
         audioContainer.classList.add("fullscreen");
         wavesurfer.setHeight(175);
      } else  {
         audioContainer.classList.remove("fullscreen");
         wavesurfer.setHeight(128);
      }
   }

   function toggleFullscreen() { // toggles fullscreen mode of audio player/editor
      if ((document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null)) {
         document.exitFullscreen();
      } else {
         audioContainer.requestFullscreen();
      }
   }
}

function formatAudioDuration(duration) {
   // console.log('duration: ' + duration);
   let [hrs, mins, secs, ms] = duration.replace(".", ":").split(":");
   return hrs + ":" + mins + ":" + secs;
}
