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

/**
 * @param audio input audio file
 * @param sectionData diarization data (.csv)
 */
function loadAudio(audio, sectionData) {
   const inputFile = sectionData;
   const mod_meta_base_url = gs.xsltParams.library_name + "?a=g&rt=r&ro=0&s=ModifyMetadata&s1.collection=" + gs.cgiParams.c + "&s1.site=" + gs.xsltParams.site_name + "&s1.d=" + gs.cgiParams.d;
   const interface_bootstrap_images = "interfaces/" + gs.xsltParams.interface_name + "/images/bootstrap/"; // path to toolbar images
   const GSSTATUS_SUCCESS = 11; // more information on codes found in: GSStatus.java
   const audioIdentifier = gs.xsltParams.site_name + ":" + gs.cgiParams.c + ":" + gs.cgiParams.d;
   const backgroundColour = "rgb(29, 40, 47)";
   const accentColour = "rgb(69, 158, 0)";
   // const accentColour = "#F8C537";
   const waveformHeight = 140; // height of waveform container
   const fullscreenWaveformHeight = 200; // height of waveform container in fullscreen mode
   const regionTransparency = "50"; // transparency of wavesurfer regions
   
   let editMode = false; 
   let currentRegion = {speaker: '', start: '', end: ''}; // currently selected region
   let currentRegions = []; // populated with currently selected regions

   let itemType; // type of input item (chapter or word)
   let longestDuration = 0; // longest region duration, sets max value of filter

   let dualMode = false; // whether user has enabled dual mode
   let secondaryLoaded = false; // whether user has loaded the secondary set
   let selectedVersions = ['current']; 
   let previousVersionsExist = true; // if audio has existing versions

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

   let canvasImages = {}; // stores canvas images of each version for fast loading from cache

   
   let colourbrewerSet = colorbrewer.Set2[8];
   let regionColourSet = [];


   let waveformContainer = document.getElementById("waveform");
   let waveformSpinner = document.getElementById('waveform-blocker');
   let loader = document.getElementById('waveform-loader');
   let initialLoad = true;
   
   wavesurfer = WaveSurfer.create({ // wavesurfer options
      // autoCenterImmediately: true,
      container: waveformContainer,
      backend: "WebAudio",
      // backgroundColor: "rgb(29, 43, 47)",
      backgroundColor: backgroundColour,
      waveColor: "white",
      progressColor: accentColour,
      // progressColor: "grey",
      // barWidth: 2,
      barMinHeight: 1,
      // barHeight: 1.2,
      // barGap: 5,
      // barRadius: 1,
      height: waveformHeight,
      cursorColor: 'black',
      // maxCanvasWidth: 32000,
      minPxPerSec: 15, // default 20
      fillParent: false,
      partialRender: true, // use the PeakCache to improve rendering speed of large waveforms
      // pixelRatio: 1, // 1 results in faster rendering
      scrollParent: true,
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
            fontSize: "12",
            fontFamily: "Courier New"
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

   // toolbar elements & event handlers
   const audioContainer = document.getElementById("audioContainer");
   const dualModeCheckbox = document.getElementById("dual-mode-checkbox");
   const wave = document.getElementsByTagName("wave")[0];
   const caretContainer = document.getElementById("caret-container");
   const primaryCaret = document.getElementById("primary-caret");
   const secondaryCaret = document.getElementById("secondary-caret");
   const chapters = document.getElementById("chapters");
   const chaptersContainer = document.getElementById("chapters-container");
   const editPanel = document.getElementById("edit-panel");
   const chapterButton = document.getElementById("chapterButton");
   const chapterSearchInput = document.getElementById("chapter-search-input");
   const chapterFilterButton = document.getElementById("funnel-button");
   const chapterFilterMenu = document.getElementById("filter-menu");
   const chapterFilterMin = document.getElementById("filter-min");
   const chapterFilterMax = document.getElementById("filter-max");
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
   const contextReplace = document.getElementById("context-menu-replace");
   const contextOverdub = document.getElementById("context-menu-overdub");
   const contextLock = document.getElementById("context-menu-lock");
   const contextDelete = document.getElementById("context-menu-delete");
   const contextDownload = document.getElementById("context-menu-download");
   const timelineMenu = document.getElementById("timeline-menu");
   const timelineMenuButton = document.getElementById("timeline-menu-button");
   const timelineMenuHide = document.getElementById("timeline-menu-hide");
   const timelineMenuDualMode = document.getElementById("timeline-menu-dualmode");
   const timelineMenuRegionConflict = document.getElementById("timeline-menu-region");
   const timelineMenuSpeakerConflict = document.getElementById("timeline-menu-speaker");
   const timelineMenuMerge = document.getElementById("timeline-menu-merge");
   const versionSelectMenu = document.getElementById('version-select-menu');
   const versionSelectLabels = document.querySelectorAll(".track-arrow");
   const savePopup = document.getElementById("save-popup");
   const savePopupBG = document.getElementById("save-popup-bg");
   const savePopupCancel = document.getElementById("save-popup-cancel");
   const savePopupCommit = document.getElementById("save-popup-commit");
   const savePopupCommitMsg = document.getElementById("commit-message");

   audioContainer.addEventListener('fullscreenchange', (e) => fullscreenChanged());
   audioContainer.addEventListener('contextmenu', onRightClick);
   audioContainer.addEventListener("keyup", keyUp);
   audioContainer.addEventListener("keydown", keyDown);
   dualModeCheckbox.addEventListener("change", () => dualModeChanged());
   wave.addEventListener('scroll', (e) => waveformScrolled())
   wave.addEventListener('mousemove', (e) => waveformCursorX = e.x);
   primaryCaret.addEventListener("click", (e) => caretClicked(e.target.id));
   secondaryCaret.addEventListener("click", (e) => caretClicked(e.target.id));
   chapters.style.height = "0px";
   chaptersContainer.style.height = "0px";
   editPanel.style.height = "0px";
   chapterButton.addEventListener("click", () => toggleChapters());
   chapterSearchInput.addEventListener("input", chapterSearchInputChange);
   chapterFilterButton.addEventListener("click", chapterFilterButtonClicked);
   chapterFilterMin.addEventListener("input", durationFilterChanged);
   chapterFilterMax.addEventListener("input", durationFilterChanged);
   chapterFilterMin.style["accent-color"] = accentColour; 
   chapterFilterMax.style["accent-color"] = accentColour; 
   zoomOutButton.addEventListener("click", () => { zoomSlider.stepDown(); zoomSlider.dispatchEvent(new Event("input")) });
   zoomInButton.addEventListener("click", () => { zoomSlider.stepUp(); zoomSlider.dispatchEvent(new Event("input")) });
   backButton.addEventListener("click", () => { wavesurfer.skipBackward(); });
   playPauseButton.addEventListener("click", () => { wavesurfer.playPause() });
   forwardButton.addEventListener("click", () => { wavesurfer.skipForward(); });
   editButton.addEventListener("click", toggleEditMode); 
   downloadButton.addEventListener("click", () => { downloadURI(audio, gs.documentMetadata.Audio) }); 
   muteButton.addEventListener("click", () => { 
      if (volumeSlider.value == 0) wavesurfer.setMute(false) 
      else wavesurfer.setMute(true) 
   });
   volumeSlider.style["accent-color"] = accentColour; 
   fullscreenButton.addEventListener("click", toggleFullscreen);
   zoomSlider.style["accent-color"] = accentColour; 
   changeAllCheckbox.addEventListener("change", () => { selectAllCheckboxChanged() });
   speakerInput.addEventListener("input", speakerChange);
   speakerInput.addEventListener("blur", speakerInputUnfocused);
   createButton.addEventListener("click", createNewRegion);
   removeButton.addEventListener("click", removeRegion);
   discardButton.addEventListener("click", () => discardRegionChanges(false));
   undoButton.addEventListener("click", undo);
   redoButton.addEventListener("click", redo);
   saveButton.addEventListener("click", saveRegionChanges);
   document.addEventListener('click', documentClicked);
   document.addEventListener('mouseup', () => mouseDown = false);
   document.addEventListener('mousedown', (e) => { if (e.target.id !== "create-button") newRegionOffset = 0 }); // resets new region offset on click
   document.querySelectorAll('input[type=number]').forEach(e => {
      e.onchange = (e) => { changeStartEndTime(e) }; // updates speaker objects when number input(s) are changed
      e.onblur = () => { prevUndoState = "" }; 
   }); 
   contextReplace.addEventListener("click", replaceSelected);
   contextOverdub.addEventListener("click", overdubSelected);
   contextLock.addEventListener("click", toggleLockSelected);
   contextDelete.addEventListener("click", removeRightClicked);
   contextDownload.addEventListener("click", downloadRegion);
   timelineMenu.addEventListener("click", e => e.stopPropagation());
   timelineMenuButton.addEventListener("click", timelineMenuToggle);
   timelineMenuHide.addEventListener("click", timelineMenuHideClicked);
   timelineMenuDualMode.addEventListener("click", () => dualModeChanged());
   timelineMenuRegionConflict.addEventListener("click", showStartStopConflicts);
   timelineMenuSpeakerConflict.addEventListener("click", showSpeakerNameConflicts);
   timelineMenuMerge.addEventListener("click", mergeTracks);

   savePopupCancel.addEventListener("click", toggleSavePopup)
   savePopupCommit.addEventListener("click", commitChanges);
   savePopupBG.addEventListener("click", toggleSavePopup);
   versionSelectLabels.forEach(arrow => arrow.addEventListener('click', toggleVersionDropdown));

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

   zoomSlider.addEventListener('input', function() { // slider changes waveform zoom
      let sliderValue = Number(this.value) / 4;
      if (sliderValue < 1) sliderValue = 1;
      // sliderValue = sliderValue > 1 ? (sliderValue / 4) : 1; // ensure value is greater than 1
      wavesurfer.zoom(sliderValue); 
      if (currentRegion.speaker && getCurrentRegionIndex() != -1) { 
         setHoverSpeaker(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left, currentRegion.speaker);
         drawCurrentRegionBounds();
      }
      let handles = document.getElementsByClassName("wavesurfer-handle");
      if (this.value < 20) {
         for (const handle of handles) handle.style.setProperty("width", "1px", "important");
      } else {
         for (const handle of handles) handle.style.setProperty("width", "3px", "important");
      }
   });
   showAudioLoader();
   
   if (gs.variables.allowEditing === '0') { 
      editButton.style.display = "none" 
      document.getElementById("track-set-label-top").style.display = "none";
      document.getElementById("track-set-label-bottom").style.display = "none";
      timelineMenuDualMode.classList.add('disabled');
      timelineMenuRegionConflict.classList.add('disabled');
      timelineMenuSpeakerConflict.classList.add('disabled');
   }

   wavesurfer.load(audio); // initial audio load

   // wavesurfer events

   wavesurfer.on('region-click', handleRegionClick);
   wavesurfer.on('region-mouseenter', function(region) { // region hover effects
      if (!mouseDown) {
         handleRegionColours(region, true); 
         setHoverSpeaker(region.element.style.left, region.attributes.label.innerText);
         if (!isInCurrentRegions(region)) {
            removeRegionBounds();
            drawRegionBounds(region, wave.scrollLeft, "black");
         } else {
            for (const reg of currentRegions) {
               reg.region.update({color: "rgba(255,50,50,0.5)"})
            }
         }
         if (isCurrentRegion(region) && editMode) drawRegionBounds(region, wave.scrollLeft, "FireBrick");
      }
   });
   wavesurfer.on('region-mouseleave', function(region) { 
      hoverSpeaker.innerHTML = "";
      if (!mouseDown) {
         if (!(wavesurfer.getCurrentTime() <= region.end && wavesurfer.getCurrentTime() >= region.start)) handleRegionColours(region, false); 
         if (!editMode) hoverSpeaker.innerHTML = "";
         removeRegionBounds();
         if (currentRegion && currentRegion.speaker && getCurrentRegionIndex() != -1) { 
            setHoverSpeaker(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left, currentRegion.speaker);
            drawCurrentRegionBounds();
         } 
      }
   });
   wavesurfer.on('region-in', function(region) { // play caret enters region
      if (!mouseDown) {
         handleRegionColours(region, true); 
         if (itemType == "chapter" && Array.from(chapters.children)[getIndexOfRegion(region)]) {
            Array.from(chapters.children)[getIndexOfRegion(region)].scrollIntoView({  
               behavior: "smooth",
               block: "nearest"
            });
         }
      }
   });
   wavesurfer.on('region-out', function(region) { handleRegionColours(region, false) });
   wavesurfer.on('region-update-end', handleRegionEdit); // end of click-drag event
   wavesurfer.on('region-updated', handleRegionSnap);
   wavesurfer.on('error', error => console.log(error));
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

   wavesurfer.on('ready', function() { // retrieve regions once waveforms have loaded
      window.onbeforeunload = (e) => { 
         if (undoStates.length > 1 && gs.variables.allowEditing === '1') { 
            e.returnValue = "Data will be lost if you leave the page, are you sure?";
            return "Data will be lost if you leave the page, are you sure?";
         }
      };
      if (document.getElementById('new-canvas')) document.getElementById('new-canvas').remove();
      setTimeout(() => { // if not delayed exportImage does not retrieve waveform (despite being in waveform-ready?)
         const currVersion = selectedVersions[(!dualMode || primaryCaret.src.includes("fill")) ? 0 : 1];
         for (let key in canvasImages) {
            if (currVersion == key && canvasImages[key] == undefined) { canvasImages[key] = wavesurfer.exportImage() } // add waveform image to cache if one isn't already assigned to the version
         }
      }, 1000);

      if (initialLoad) {
         if (inputFile.endsWith("csv")) { // diarization if csv
            itemType = "chapter";
            if (localStorage.getItem(audioIdentifier) !== null) { // localStorage save exists
               console.log('-- Loading regions from localStorage --');
               editsMade = true;
               undoStates = JSON.parse(localStorage.getItem(audioIdentifier)).undoStates;
               undoLevel = JSON.parse(localStorage.getItem(audioIdentifier)).undoLevel;
               primarySet.tempSpeakerObjects = undoStates[undoLevel].state;
               primarySet.speakerObjects = cloneSpeakerObjectArray(primarySet.tempSpeakerObjects);
               primarySet.uniqueSpeakers = [];
               for (const item of primarySet.tempSpeakerObjects) {
                  if (!primarySet.uniqueSpeakers.includes(item.speaker)) primarySet.uniqueSpeakers.push(item.speaker);
               }
               populateChaptersAndRegions(primarySet);
               if (undoStates[undoLevel].secState && undoStates[undoLevel].secState.length > 0) {
                  secondarySet.tempSpeakerObjects = undoStates[undoLevel].secState;
                  secondarySet.speakerObjects = cloneSpeakerObjectArray(secondarySet.tempSpeakerObjects);
                  secondarySet.uniqueSpeakers = [];
                  for (const item of secondarySet.tempSpeakerObjects) {
                     if (!secondarySet.uniqueSpeakers.includes(item.speaker)) secondarySet.uniqueSpeakers.push(item.speaker);
                  }
                  secondaryLoaded = true;
               }
               updateRegionEditPanel(); 
            } else {
               loadCSVFile(inputFile, primarySet);
               dualModeChanged(true, "true");
               setTimeout(()=>{
                  dualModeChanged(true, "false");
               }, 150);
            }
         } else if (inputFile.endsWith("json")) { // transcription if json
            itemType = "word";
            loadJSONFile(inputFile);
         } else {                      
            console.log("Filetype of " + inputFile + " not supported.")
         }
         
         chapters.style.cursor = "default"; // remove load cursor
         wave.className = "audio-scroll";
         $.ajax({
            type: "GET",
            url: gs.variables.metadataServerURL,
            data: { a: 'get-fldv-info', site: gs.xsltParams.site_name, c: gs.cgiParams.c, d: gs.cgiParams.d },
            dataType: "json",
         }).then(data => {
            if (data.includes("ERROR")) {
               console.log("get-fldv-info Error: " + data);
            } else if (data.length === 0) {
               previousVersionsExist = false;
               // console.log("no previous versions found");
               $(".track-set-label").hide();
               // $(".timeline-menu-item").hide();
               timelineMenuDualMode.remove();
               timelineMenuRegionConflict.remove();
               timelineMenuSpeakerConflict.remove();
               $(".timeline-menu-subtext").remove();
            } else {
               for (const version of ["current", ...data]) {
                  canvasImages[version] = undefined;
                  let menuItem = document.createElement("div");
                  menuItem.classList.add("version-select-menu-item");
                  menuItem.id = version;
                  let text = version.includes("nminus") ? version.replace("nminus-", "Previous(") + ")" : version;
                  menuItem.innerText = text.charAt(0).toUpperCase() + text.slice(1);
                  menuItem.addEventListener('click', versionClicked);
                  let dataObj = { a: 'get-archives-metadata', site: gs.xsltParams.site_name, c: gs.cgiParams.c, d: gs.cgiParams.d, metaname: "commitmessage" };
                  if (version != "current") Object.assign(dataObj, {dv: version});
                  $.ajax({ // get commitmessage metadata to show as hover tooltip
                     type: "GET",
                     url: gs.variables.metadataServerURL,
                     data: dataObj,
                     dataType: "text",
                  }).then(comment => {
                     if (data.includes("ERROR")) {
                        console.log("get-archives-metadata Error: " + data);
                     } else {
                        menuItem.title = "Commit message: " + comment;
                        versionSelectMenu.append(menuItem);
                        [...versionSelectMenu.children].sort((a,b) => a.innerText>b.innerText?1:-1).forEach(n=>versionSelectMenu.appendChild(n)); // sort alphabetically
                     }
                  }, (error) => { console.log("get-archives-metadata error:"); console.log(error); });
                  $.ajax({ // get conflict status of each version 
                     type: "GET",
                     url: getCSVURLFromVersion(version),
                     dataType: "text",
                  }).then(csvData => {
                     setTimeout(()=>{ // timeout is needed for some reason ?? TODO
                        if (version === "current") checkCSVForConflict("current", "", primarySet.tempSpeakerObjects);
                        else checkCSVForConflict(version, csvData);
                     }, 1000)
                  }, (error) => { console.log("get-archives-metadata error:"); console.log(error); });
               }
            }
         }, (error) => { console.log("get-fldv-info error:"); console.log(error); });
         initialLoad = false;
      }
      // fixes blank waveform/regions when loading Current -> Prev.1 -> Prev.2
      // **** workaround to avoid getting low-res peaks being drawn 
      wavesurfer.zoom((zoomSlider.value + 4) / 4);
      wavesurfer.zoom((zoomSlider.value) / 4);
      hideAudioLoader();
   });

   /**
    * Draws conflict icon next to versions containing conflicts
    * @param {String} version Audio version
    * @param {String} csvData CSV data of given version
    * @param {*} spkrObj If CSV data is not given, speakerObjects are instead checked
    */
   function checkCSVForConflict(version, csvData, spkrObj) {  
      if (editMode && previousVersionsExist) {
         let hasConflict = false;
         if (csvData !== "") {
            let dataLines = csvData.split(/\r\n|\n/);
            for (const line of dataLines) {
               const speaker = line.split(",")[0];
               if (speaker.includes("conflict")) {
                  hasConflict = true;
                  break;
               }
            }
         } else {
            for (const entry of spkrObj) {
               if (entry.speaker.includes("conflict")) {
                  hasConflict = true;
                  break;
               }
            }
         }
         if (hasConflict && document.getElementById(version) && document.getElementById(version).children.length === 0) { // draw icon if conflict was found
            let img = document.createElement("img");
            img.className = "version-has-conflict";
            img.src = interface_bootstrap_images + "exclamation-red.svg";
            document.getElementById(version).append(img);
         }
         if (!hasConflict && document.getElementById(version) && document.getElementById(version).children.length === 1) { // ensure icon is removed if conflict wasn't found
            document.getElementById(version).getElementsByClassName("version-has-conflict")[0].remove();
         }
      }
   }

   /**
   * Draws string above waveform at the provided offset
   * @param {number} offset Offset (from left) to desired location
   * @param {string} name String to be drawn
   */
   function setHoverSpeaker(offset, name) {
      // replaces 'dur_lock' with clock icon and 'spkr_lock' with person icon to indicate conflict types
      let icons = document.createElement("span");
      if (name.includes("dur_lock:")) {
         let img = document.createElement("img");
         img.className = "conflict-hover-icon";
         img.src = interface_bootstrap_images + "clock.svg";
         img.title = "This region represents a start/stop time conflict";
         icons.prepend(img);
      }
      if (name.includes("spkr_lock:")) {
         let img = document.createElement("img");
         img.className = "conflict-hover-icon";
         img.src = interface_bootstrap_images + "person.svg";
         img.title = "This region represents a speaker name conflict";
         icons.prepend(img);
      }
      // remove strings from hover string
      name = name.replace("spkr_lock:", "");
      name = name.replace("dur_lock:", "");
      hoverSpeaker.innerHTML = "";
      hoverSpeaker.prepend(icons);
      hoverSpeaker.append(name);
      let newOffset = parseInt(offset.slice(0, -2)) - wave.scrollLeft;
      hoverSpeaker.style.marginLeft = newOffset + "px";
   }

   /** Click handler, manages selected region/s, set swapping, region playing */
   function handleRegionClick(region, e) { 
      if (e.target.classList.contains("region-menu")) return;
      e.stopPropagation();
      contextMenu.classList.remove('visible');
      if (!editMode) { // play region audio on click
         wavesurfer.play(region.start); // plays from start of region
      } else { // select or deselect current region
         if (!region.element) return;
         chapterSearchInput.value = "";
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
            currentRegion = region;
            currentRegion.speaker = currentRegion.attributes.label.innerText;
            wavesurfer.backend.seekTo(currentRegion.start);
         } else if (e.ctrlKey) { // control was held during click
            if (currentRegions.length == 0 && isCurrentRegion(region)) {
               removeCurrentRegion();
            } else if (getCurrentRegionIndex() != -1 && isInCurrentRegions(region)) {
               const removeIndex = getIndexInCurrentRegions(region);
               if (removeIndex != -1) currentRegions.splice(removeIndex, 1);
               if (currentRegions.length > 0 && isCurrentRegion(region)) { // change current region if removed
                  currentRegion = currentRegions[0];
               }
            } else {
               if (currentRegions.length < 1) currentRegions.push(currentRegion);
               if (getIndexInCurrentRegions(region) == -1) currentRegions.push(region); // add if it doesn't already exist
               currentRegion = region;
               currentRegion.speaker = currentRegion.attributes.label.innerText;
               wavesurfer.backend.seekTo(currentRegion.start); 
            }
            if (currentRegions.length == 1)  currentRegions = []; // clear selected regions if there is only one
         } else if (e.shiftKey) { // shift was held during click
            setChapterSearch("");
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

   /**
   * Returns index of given region within the currently selected regions
   * @param {object} region Region within currently selected regions to return index for
   * @returns {int} Index position of region
   */
   function getIndexInCurrentRegions(region) {
      for (const reg of currentRegions) {
         const regSpeaker = reg.attributes ? reg.attributes.label.innerText : reg.speaker;
         if (reg.start == region.start && reg.end == region.end && regSpeaker == region.attributes.label.innerText) {
            return currentRegions.indexOf(reg);
         }
      }
      return -1;
   }

   /**
   * Returns index of region within speakerObject array
   * @param {object} region Region to return index for
   * @returns {int} Index position of region
   */
   function getIndexOfRegion(region) {
      for (const reg of currSpeakerSet.tempSpeakerObjects) {
         if (region.attributes && reg.start == region.start && reg.end == region.end && reg.speaker == region.attributes.label.innerText) {
            return currSpeakerSet.tempSpeakerObjects.indexOf(reg);
         }
      }
      return -1;
   }

   /** 
   * Builds metadata-server.pl URL to retrieve audio at given version 
   * @param {string} version GS document version to retrieve from (nminus-X)
   */
   function getAudioURLFromVersion(version) {
      let base_url = gs.variables.metadataServerURL + "?a=get-archives-assocfile&site=" + gs.xsltParams.site_name + "&c=" + gs.cgiParams.c + "&d=" + gs.cgiParams.d;
      if (version !== "current") base_url += "&dv=" + version // get fldv if not current version
      return base_url  + "&assocname=" + gs.documentMetadata.Audio;
   }

   /** 
   * Builds metadata-server.pl URL to retrieve CSV at given version 
   * @param {string} version GS document version to retrieve from (nminus-X)
   */
   function getCSVURLFromVersion(version) {
      let base_url = gs.variables.metadataServerURL + "?a=get-archives-assocfile&site=" + gs.xsltParams.site_name + "&c=" + gs.cgiParams.c + "&d=" + gs.cgiParams.d;
      if (version !== "current") base_url += "&dv=" + version; // get fldv if not current version
      return base_url  + "&assocname=" + "structured-audio.csv";
   }

   /** Version click handler, first checks if changes have been made and shows popup if true */
   function versionClicked(e) {
      let unsavedChanges = false;
      if (undoStates.length > 0) { // only if changes have been made in track being changed FROM
         let clickedVersionPos = e.target.parentElement.classList.contains('versionTop') ? 0 : 1;
         for (const state of undoStates) {
            if (state.changedTrack == selectedVersions[clickedVersionPos]) {
               unsavedChanges = true;
               break;
            }
         }
      } 
      if (unsavedChanges) {
         const areYouSure = "There are unsaved changes.\nAre you sure you want to lose changes made in this version?";
         if (window.confirm(areYouSure)) {
            console.log('OK');
            discardRegionChanges(true);
            changeVersion(e);
         } else {
            console.log('CANCEL');
            return;
         }
      } else changeVersion(e);
   }

   /** Changes current audio/csv set to clicked version's equivalent */
   function changeVersion(e) {  
      removeCurrentRegion();
      const audio_url = getAudioURLFromVersion(e.target.id);
      const csv_url = getCSVURLFromVersion(e.target.id);
      versionSelectMenu.classList.remove('visible');
      const setToUpdate = e.target.parentElement.classList.contains('versionTop') ? primarySet : secondarySet;
      if (e.target.parentElement.classList.contains('versionTop')) {
         if (!currSpeakerSet.isSecondary) {
            if (dualMode) $(".region-top").remove();
            else $(".wavesurfer-region").remove();
            showAudioLoader();
            // if (canvasImages[e.target.id]) { // if waveform image exists in cache
            //    drawImageOnWaveform(canvasImages[e.target.id]);
            // }            
            wavesurfer.load(audio_url); // load audio
         } else {
            $(".region-top").remove();
         }
         document.getElementById('track-set-label-top').children[0].innerText = e.target.id.includes("nminus") ? e.target.id.replace("nminus-", "Previous(") + ")" : "Current"; // update top label text
         selectedVersions[0] = e.target.id; // update the selected versions
      } else {
         if (currSpeakerSet.isSecondary) {
            if (dualMode) $(".region-bottom").remove();
            else $(".wavesurfer-region").remove();
            showAudioLoader();
            // if (canvasImages[e.target.id]) { // if waveform image exists in cache
            //    drawImageOnWaveform(canvasImages[e.target.id]);
            // }
            wavesurfer.load(audio_url);
         } else {
            $(".region-bottom").remove();
         }
         document.getElementById('track-set-label-bottom').children[0].innerText = e.target.id.includes("nminus") ? e.target.id.replace("nminus-", "Previous(") + ")" : "Current"; // update bottom label text
         selectedVersions[1] = e.target.id;
      }
      loadCSVFile(csv_url, setToUpdate, true);
   }
   
   /** Utility function to download audio */
   function downloadURI(loc, name) {
      let link = document.createElement("a");
      link.download = name;
      link.href = loc;
      link.click();
   }

   function downloadRegion(e) {
      if (e) e.stopPropagation(); 
      if (getCurrentRegionIndex() != -1 && currentRegions.length <= 1) { // single selected
         const region = currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region; 
         const sampleRate = wavesurfer.backend.ac.sampleRate;
         const duration = region.end - region.start;
         const saveName = (gs.documentMetadata.Title + "-[" + region.attributes.label.innerText + "]").replace(/ /g,"_"); // replaces all spaces with "_" : e.g. Bella_A-[Jim_Wilson]
         let link = document.createElement("a");
         link.download = saveName;
         link.href = bufferToWave(wavesurfer.backend.buffer, Math.round(region.start * sampleRate), Math.round(duration * sampleRate));
         link.click();
      } else {
         console.log("ensure just one region is selected")
      }
   }

   /**
      * Convert a audio-buffer segment to a Blob using WAVE representation
      * The returned Object URL can be set directly as a source for an Auido element.
      * https://stackoverflow.com/questions/60079764/how-to-export-wavesurfer-js-as-audio-file
      * @param {int} abuffer Audio buffer
      * @param {int} offset Start position in bytes
      * @param {int} len Length of download in bytes
   */
   function bufferToWave(abuffer, offset, len) {

      var numOfChan = abuffer.numberOfChannels,
         length = len * numOfChan * 2 + 44,
         buffer = new ArrayBuffer(length),
         view = new DataView(buffer),
         channels = [], i, sample,
         pos = 0;
         
      // write WAVE header
      setUint32(0x46464952);                         // ChunkID: "RIFF"
      setUint32(length - 8);                         // ChunkSize: file length - 8
      setUint32(0x45564157);                         // Format: "WAVE"
      
      setUint32(0x20746d66);                         // SubChunk1ID: "fmt "
      setUint32(16);                                 // SubChunk1Size: 16
      setUint16(1);                                  // AudioFormat: PCM (uncompressed)
      setUint16(numOfChan);                          // NumChannels
      setUint32(abuffer.sampleRate);                 // SampleRate
      setUint32(abuffer.sampleRate * 2 * numOfChan); // ByteRate: avg. bytes/sec
      setUint16(numOfChan * 2);                      // BlockAlign: block-align
      setUint16(16);                                 // BitsPerSample: 16-bit (hardcoded in this demo)
      
      setUint32(0x61746164);                         // SubChunk2ID: "data" - chunk
      setUint32(length - pos - 4);                   // SubChunk2Size: chunk length
      
      // write interleaved data
      for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
      
      while (pos < length) {
         for (i = 0; i < numOfChan; i++) {           // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);        // update data chunk
            pos += 2;
         }
         offset++                                    // next source sample
      }
   
      // create Blob
      return (URL || webkitURL).createObjectURL(new Blob([buffer], {type: "audio/wav"}));
      
      function setUint16(data) { // write two bytes
         view.setUint16(pos, data, true);
         pos += 2;
      }
      
      function setUint32(data) { // write four bytes
         view.setUint32(pos, data, true);
         pos += 4;
      }
   }

   /** Document click listener for context box closure and region deselection */
   function documentClicked(e) { // document on click
      if (e.target.classList.contains("region-menu")) return;
      contextMenu.classList.remove('visible'); 
      timelineMenu.classList.remove('visible'); 
      versionSelectMenu.classList.remove('visible'); 
      versionSelectLabels.forEach(arrow => {
         // arrow.style.transform = 'rotate(90deg)';
         // arrow.style.paddingTop = '0';
         arrow.style.display = 'inline';
      });
      // console.log(e.target.classList)
      if (editMode && e.target.tagName !== "INPUT" && e.target.tagName !== "IMG" && !e.target.classList.contains("ui-button") && !$("#audio-dropdowns").has($(e.target)).length
         && !e.target.classList.contains("context-menu-item") && !e.target.classList.contains("ui-menu-item-wrapper")) {
         let currReg = getCurrentRegionIndex() != -1 ? currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region : false; // save for deselection
         let currRegs = getCurrentRegionsIndexes().length > 1 ? currentRegions : false; // save for deselection
         removeCurrentRegion();
         reloadChapterList();
         if (currReg != false) regionLeave(currReg); // deselect curr region
         if (currRegs != false) {
            for (const reg of currRegs) {
               regionLeave(reg.region); // deselect curr regions
               regionLeave(reg.region); // deselect curr regions
            }
         }
         removeRegionBounds();
         removeButton.innerHTML = "Remove Selected Region";
         updateRegionEditPanel();
      }
   }

   /** Draws and returns padlock image at given parent element */
   function drawPadlock(parent) { 
      let lockedImg = document.createElement("img");
      lockedImg.classList.add("region-padlock");
      lockedImg.src = interface_bootstrap_images + "lock.svg";
      lockedImg.title = "This region is locked. Click to unlock region.";
      parent.prepend(lockedImg); 
      return lockedImg;
   }

   /** Draws conflict marker image at given parent element */
   function drawConflictMarker(parent) {
      let conflictImg = document.createElement("img");
      conflictImg.classList.add("region-conflict");
      conflictImg.src = interface_bootstrap_images + "exclamation.svg";
      conflictImg.title = "This region has conflicts and should be revised.";
      parent.prepend(conflictImg); 
   }

   /**
    * Draws triple dot menu button and attaches click listener
    * @param {object} region Region to attach menu button to
    */
   function drawRegionMenuButton(region) {
      let menuImg = document.createElement("img");
      menuImg.src = interface_bootstrap_images + "menu.svg";
      menuImg.classList.add("region-menu");
      menuImg.title = "Show region options";
      menuImg.addEventListener("click", e => {
         audioContainer.dispatchEvent(new MouseEvent("contextmenu", { clientX: menuImg.x + 20, clientY: menuImg.y + 5 }));
      });
      region.element.append(menuImg);
   }

   /**
   * Attaches a click listener to given padlock element
   * @param padlock Element to attach listener to
   * @param region Associated region 
   * @param isChapter Whether padlock exists in chapter (true) or wavesurfer region (false)
   */
   function attachPadlockListener(padlock, region, isChapter) {
      if (isChapter == true) {
         padlock.addEventListener('click', () => { // attach to chapter padlock
            let index = getIndexOfRegion(region);
            currSpeakerSet.tempSpeakerObjects[index].locked = false;
            padlock.classList.add('hide');
            if (currSpeakerSet.tempSpeakerObjects[index].region.element.firstChild) currSpeakerSet.tempSpeakerObjects[index].region.element.firstChild.remove();
            addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "lockChange", index);
         });
      } else {
         padlock.addEventListener('click', () => { // attach to region padlock
            let index = getIndexOfRegion(region);
            currSpeakerSet.tempSpeakerObjects[index].locked = false;
            padlock.remove();
            addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "lockChange", index);
         });
      }
   }

   /** Locks or unlocks selected region based on its current state */
   function toggleLockSelected(e) { // locks / unlocks selected region(s) 
      if (e) e.stopPropagation(); 
      if (getCurrentRegionIndex() != -1 && currentRegions.length <= 1) { // single selected
         let currIndex = getCurrentRegionIndex(); 
         currSpeakerSet.tempSpeakerObjects[currIndex].locked = !e.target.innerText.includes("Unlock"); 
         if (currSpeakerSet.tempSpeakerObjects[currIndex].locked) {
            chapters.childNodes[currIndex].childNodes[1].classList.remove('hide'); 
            let lock = drawPadlock(currSpeakerSet.tempSpeakerObjects[currIndex].region.element);
            attachPadlockListener(lock, currSpeakerSet.tempSpeakerObjects[currIndex].region, false);
            contextLock.innerText = "Unlock Selected";
         } else {
            chapters.childNodes[currIndex].childNodes[1].classList.add('hide');
            if (currSpeakerSet.tempSpeakerObjects[currIndex].region.element.getElementsByClassName("region-padlock").length > 0) {
               currSpeakerSet.tempSpeakerObjects[currIndex].region.element.getElementsByClassName("region-padlock")[0].remove();
            }
            contextLock.innerText = "Lock Selected";
         }
      } else if (currentRegions.length > 1) { // multiple selected
         let toLock = !e.target.innerText.includes("Unlock");
         for (const idx of getCurrentRegionsIndexes()) {
            currSpeakerSet.tempSpeakerObjects[idx].locked = toLock;
            if (currSpeakerSet.tempSpeakerObjects[idx].locked) {
               chapters.childNodes[idx].childNodes[1].classList.remove('hide'); 
               if (currSpeakerSet.tempSpeakerObjects[idx].region.element.getElementsByClassName("region-padlock").length == 0) {
                  let lock = drawPadlock(currSpeakerSet.tempSpeakerObjects[idx].region.element);
                  attachPadlockListener(lock, currSpeakerSet.tempSpeakerObjects[idx].region, false);
               }
               contextLock.innerText = "Unlock Selected";
            } else {
               chapters.childNodes[idx].childNodes[1].classList.add('hide');
               if (currSpeakerSet.tempSpeakerObjects[idx].region.element.getElementsByClassName("region-padlock").length > 0) {
                  currSpeakerSet.tempSpeakerObjects[idx].region.element.getElementsByClassName("region-padlock")[0].remove();
               }
               contextLock.innerText = "Lock Selected";
            }
         }
         if (document.getElementById("context-menu-lock-2")) document.getElementById("context-menu-lock-2").remove();
      }
      updateChapterConflictIcons();
      addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "lockChange", getCurrentRegionIndex());
   }

   function timelineMenuHideClicked(e) { // hides all regions and chapter/edit divs
      if (!e.target.children[0].checked) {
         e.target.children[0].checked = true;
         timelineMenuDualMode.classList.add('disabled');
         timelineMenuRegionConflict.classList.add('disabled');
         timelineMenuSpeakerConflict.classList.add('disabled');
         if (editPanel.style.height != "0px") toggleEditMode();
         if (chapters.style.height != "0px") toggleChapters();
         $('.wavesurfer-region').fadeOut(100);
      }
      else {
         e.target.children[0].checked = false;
         timelineMenuDualMode.classList.remove('disabled');
         timelineMenuRegionConflict.classList.remove('disabled');
         timelineMenuSpeakerConflict.classList.remove('disabled');
         let fadeIn = true;
         if (timelineMenuRegionConflict.firstElementChild.checked) {
            showStartStopConflicts(e, true);
            fadeIn = false;
         }
         if (timelineMenuSpeakerConflict.firstElementChild.checked) {
            showSpeakerNameConflicts(e, true);
            fadeIn = false;
         }
         if (fadeIn) $('.wavesurfer-region').fadeIn(100); 
      }
   }

   function chapterSearchInputChange(e) { // filters chapters and regions by given speaker name
      if (e.isTrusted) { // triggered from user action
         if (document.getElementById("chapter-alert")) document.getElementById("chapter-alert").remove();
         let matches = 0;
         reloadChapterList(); // fixes search bug -> space showing up in chapter speaker name
         for (const idx in chapters.children) {
            if (chapters.children[idx].firstChild && chapters.children[idx].classList.contains("chapter") && currSpeakerSet.tempSpeakerObjects[idx]
               && currSpeakerSet.tempSpeakerObjects[idx].region && currSpeakerSet.tempSpeakerObjects[idx].region.element) {
               if (e.composed) removeCurrentRegion(); // composed true if called from input, false if manually triggered event
               if (!chapters.children[idx].firstChild.innerText.toLowerCase().includes(e.target.value.toLowerCase())) {
                  chapters.children[idx].style.display = "none";
                  currSpeakerSet.tempSpeakerObjects[idx].region.element.style.display = "none";
               } else if (getDurationFilterMatches().includes(idx)) {
                  chapters.children[idx].style.display = "flex";
                  currSpeakerSet.tempSpeakerObjects[idx].region.element.style.display = "";
                  matches++;
                  if (e.target.value.length > 0) { 
                     const reg = new RegExp(e.target.value, 'gi'); // [g]lobal, [i]gnore case
                     chapters.children[idx].firstChild.innerHTML = chapters.children[idx].firstChild.innerText.replace(reg, '<b>$&</b>'); // highlights matching text
                  } else {
                     chapters.children[idx].firstChild.innerHTML = chapters.children[idx].firstChild.innerText; // highlights matching text
                  }
               }
            }
         }
         flashChapters();
         document.getElementById("filter-count").innerText = "x" + matches;
         if (matches == chapters.children.length || matches == 0) document.getElementById("filter-count").innerText = "";
         if (matches == 0) {
            const msg = document.createElement("span");
            msg.innerHTML = "No Matches!";
            msg.id = "chapter-alert";
            chapters.prepend(msg);
         }  
         updateChapterConflictIcons();
      }
   }

   function setChapterSearch(text) { // clears search filter and updates results
      chapterSearchInput.value = text;
      chapterSearchInput.dispatchEvent(new Event("input"));
   }

   function chapterFilterButtonClicked(e) { 
      if (chapterFilterMenu.classList.contains("show")) {
         chapterFilterMenu.classList.remove("show");
      } else {
         chapterFilterMenu.classList.add("show");
      }
   }

   /** Shows or hides regions based on their duration */
   function durationFilterChanged(e) { 
      document.getElementById("filter-min-label").innerText = minutize(chapterFilterMin.value, true) + "s";
      document.getElementById("filter-max-label").innerText = minutize(chapterFilterMax.value, true) + "s";
      if (document.getElementById("chapter-alert")) document.getElementById("chapter-alert").remove();
      let matches = 0;
      for (const idx in chapters.children) {
         if (chapters.children[idx].firstChild && chapters.children[idx].classList.contains("chapter") && currSpeakerSet.tempSpeakerObjects[idx]
            && currSpeakerSet.tempSpeakerObjects[idx].region && currSpeakerSet.tempSpeakerObjects[idx].region.element) {
            const duration = currSpeakerSet.tempSpeakerObjects[idx].region.end - currSpeakerSet.tempSpeakerObjects[idx].region.start;
            if (duration < chapterFilterMin.value || duration > chapterFilterMax.value) {
               chapters.children[idx].style.display = "none";
               currSpeakerSet.tempSpeakerObjects[idx].region.element.style.display = "none";
            } else if (getSpeakerFilterMatches().includes(idx)){
               chapters.children[idx].style.display = "flex";
               currSpeakerSet.tempSpeakerObjects[idx].region.element.style.display = "";
               matches++;
            }
         }
      }
      flashChapters();
      document.getElementById("filter-count").innerText = "x" + matches;
      if (matches == chapters.children.length || matches == 0) document.getElementById("filter-count").innerText = "";
      if (matches == 0) {
         const msg = document.createElement("span");
         msg.innerHTML = "No Matches!";
         msg.id = "chapter-alert";
         chapters.prepend(msg);
      }  
   }

   /** Utility function for duration filter */
   function getSpeakerFilterMatches() {
      let out = []
      for (const idx in chapters.children) {
         if (chapters.children[idx].firstChild && chapters.children[idx].classList.contains("chapter") && currSpeakerSet.tempSpeakerObjects[idx]
         && currSpeakerSet.tempSpeakerObjects[idx].region && currSpeakerSet.tempSpeakerObjects[idx].region.element) {
            if (chapters.children[idx].firstChild.innerText.toLowerCase().includes(chapterSearchInput.value.toLowerCase())) {
               out.push(idx);
            }
         }
      }
      return out;
   }
   
   /** Utility function for speaker filter */
   function getDurationFilterMatches() {
      let out = [];
      for (const idx in chapters.children) {
         if (chapters.children[idx].firstChild && chapters.children[idx].classList.contains("chapter") && currSpeakerSet.tempSpeakerObjects[idx]
            && currSpeakerSet.tempSpeakerObjects[idx].region && currSpeakerSet.tempSpeakerObjects[idx].region.element) {
            const duration = currSpeakerSet.tempSpeakerObjects[idx].region.end - currSpeakerSet.tempSpeakerObjects[idx].region.start;
            if (duration >= chapterFilterMin.value && duration <= chapterFilterMax.value) {
               out.push(idx);
            }
         }
      }
      return out;
   }

   /** Hides regions that have identical start/stop time */
   function showStartStopConflicts(e, forceRun) { 
      removeCurrentRegion();
      if ((dualMode && !timelineMenuRegionConflict.children[0].checked) || forceRun) {
         timelineMenuRegionConflict.children[0].checked = true;
         let primHide = [];
         let secHide = [];
         if (!timelineMenuSpeakerConflict.children[0].checked) hideAll();
         for (const primIdx in primarySet.tempSpeakerObjects) {
            for (const secIdx in secondarySet.tempSpeakerObjects) {
               if (regionsMatch(primarySet.tempSpeakerObjects[primIdx], secondarySet.tempSpeakerObjects[secIdx])) { // if regions have same start/end time, hide
                  primHide.push(primIdx);
                  secHide.push(secIdx);
               }
            }
         }
         for (const primIdx in primarySet.tempSpeakerObjects) {
            if (!primHide.includes(primIdx)) {
               primarySet.tempSpeakerObjects[primIdx].region.element.style.display = "";
               if (primaryCaret.src.includes('fill')) chapters.children[primIdx].style.display = "flex";
            }
         }
         for (const secIdx in secondarySet.tempSpeakerObjects) {
            if (!secHide.includes(secIdx)) {
               secondarySet.tempSpeakerObjects[secIdx].region.element.style.display = "";
               if (secondaryCaret.src.includes('fill')) chapters.children[secIdx].style.display = "flex";
            }
         }
      } else {
         timelineMenuRegionConflict.children[0].checked = false;
         if (timelineMenuSpeakerConflict.children[0].checked) showSpeakerNameConflicts(e, true);
         else clearConflicts();
      }
   }
   
   function showSpeakerNameConflicts(e, forceRun) { // shows regions that have identical start/stop time but different names 
      removeCurrentRegion();
      if ((dualMode && !timelineMenuSpeakerConflict.children[0].checked) || forceRun) {
         timelineMenuSpeakerConflict.children[0].checked = true;
         if (!timelineMenuRegionConflict.children[0].checked) hideAll();
         for (const primIdx in primarySet.tempSpeakerObjects) {
            for (const secIdx in secondarySet.tempSpeakerObjects) {
               if (regionsMatch(primarySet.tempSpeakerObjects[primIdx], secondarySet.tempSpeakerObjects[secIdx]) &&
               primarySet.tempSpeakerObjects[primIdx].speaker != secondarySet.tempSpeakerObjects[secIdx].speaker) { // hide if regions match but names don't
                  primarySet.tempSpeakerObjects[primIdx].region.element.style.display = "";
                  secondarySet.tempSpeakerObjects[secIdx].region.element.style.display = "";
                  if (primaryCaret.src.includes('fill')) chapters.children[primIdx].style.display = "flex";
                  else chapters.children[secIdx].style.display = "flex";
               }
            }
         }
      } else {
         timelineMenuSpeakerConflict.children[0].checked = false;
         if (timelineMenuRegionConflict.children[0].checked) showStartStopConflicts(e, true);
         else clearConflicts();
      }
   }

   function clearConflicts() { // shows all regions and chapters
      for (const primIdx in primarySet.tempSpeakerObjects) {
         for (const secIdx in secondarySet.tempSpeakerObjects) {
            primarySet.tempSpeakerObjects[primIdx].region.element.style.display = "";
            secondarySet.tempSpeakerObjects[secIdx].region.element.style.display = "";
            chapters.children[primIdx].style.display = "flex";
         }
      }
   }

   /**
    * Merges the two visible tracks using DOVER-Lock, generating a new consensus output
    */
   function mergeTracks() {
      console.log("merging tracks...");
      if (dualMode) {
         let primaryRTTM = speakerObjectToRTTM(primarySet.tempSpeakerObjects);
         let secondaryRTTM = speakerObjectToRTTM(secondarySet.tempSpeakerObjects);
         // TODO: call gs function to merge two tracks.
      }
      // console.log("tracks merged.");
   }

   /**
    * Convert speaker object to updated 12-field RTTM format to be used as input to DOVER-Lock system
    * @param {Object} obj Speaker object to be converted 
    * @returns {String} Space-delimited RTTM string representing all speaker regions found in object
    */
   function speakerObjectToRTTM(obj) { 
      let output = "";
      for (const entry of obj) {
         const regex = new RegExp("SPEAKER_\\d{2}");
         let speaker_lock = !regex.test(entry.speaker);
         let line = ["SPEAKER", gs.documentMetadata.Title.replace(" ", "-"), "1", parseFloat(entry.start).toFixed(2), parseFloat(entry.end-entry.start).toFixed(2), 
            "<NA>","<NA>", entry.speaker, "<NA>", entry.locked?1:0, speaker_lock?1:0, (entry.locked || speaker_lock)?1:0].join(" ");
         output = output.concat("\n", line);
      }
      return output;
   }

   /** TODO
    * Convert RTTM file to CSV to be set ass assoc file
    * Also populates a speaker object to represent DOVER-Lock output version
    * @param {*} rttm 
    */
   function RTTMToCSV(rttm) {
      let output = "";
      return output;
   }

   function hideAll() { // hides all regions and chapters
      for (const primIdx in primarySet.tempSpeakerObjects) {
         for (const secIdx in secondarySet.tempSpeakerObjects) {
            primarySet.tempSpeakerObjects[primIdx].region.element.style.display = "none";
            secondarySet.tempSpeakerObjects[secIdx].region.element.style.display = "none";
            chapters.children[primIdx].style.display = "none";
         }
      }
   }

   function timelineMenuToggle(e) { // shows / hides timeline menu
      e.stopPropagation();
      if (timelineMenu.classList.contains('visible')) {
         timelineMenu.classList.remove('visible');
         e.target.style.transform = 'rotate(0deg)';
      }
      else {
         timelineMenu.classList.add('visible');
         e.target.style.transform = 'rotate(-90deg)';
      }
   }

   function handleRegionSnap(region, e) { // clips region to opposite set region if nearby, called on region update (lots)
      if (editMode && currentRegion && !wavesurfer.isPlaying()) { 
         removeRegionBounds();
         setHoverSpeaker(region.element.style.left, currentRegion.speaker);
         drawRegionBounds(region, wave.scrollLeft, "FireBrick"); // gets set to red if currRegion
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

   /** 
   * Returns snap value if near [snapRadius] adjacent region edge
   * @param newDragPos Drag position in seconds to check for
   * @param speakerSet Adjacent region set
   * @returns {number} If found, returns snapped position, otherwise returns input position
   */
   function getSnapValue(newDragPos, speakerSet) { 
      const snapRadius = 1;      
      for (const region of speakerSet) { // scan opposite region for potential snapping points
         if (newDragPos > parseFloat(region.start) - snapRadius && newDragPos < parseFloat(region.start) + snapRadius) { 
            snappedTo = "start";
            if (snappedToX == 0) snappedToX = waveformCursorX;
            return region.start; 
         }
         if (newDragPos > parseFloat(region.end) - snapRadius && newDragPos < parseFloat(region.end) + snapRadius) {
            snappedTo = "end";
            if (snappedToX == 0) snappedToX = waveformCursorX;
            return region.end; 
         }
         if (snappedTo !== "none" && (waveformCursorX - snappedToX > 10 || waveformCursorX - snappedToX < -10)) {
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
      if (!e.target.classList.contains('disabled')) {
         removeRegion();
      }
   }

   function replaceSelected(e) { // moves selected region across, replaces and removes any overlapping regions in the opposite set 
      if (!e.target.classList.contains('disabled')) {
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

   function containsRegion(set, region) { // true if given region exists in given set
      for (const item of set) {
         if (regionsMatch(region, item)) return true;
      }
      return false;
   }

   function overdubSelected(e) { // moves selected region across, merges any overlapping regions in the opposite set 
      if (!e.target.classList.contains('disabled')) {
         let destinationSet = secondarySet; // replace down
         if (currSpeakerSet.isSecondary) destinationSet = primarySet; // replace up
         let backup;
         if (destinationSet.isSecondary) backup = cloneSpeakerObjectArray(primarySet.tempSpeakerObjects); // saves selected set as this process changes values in selected set
         else backup = cloneSpeakerObjectArray(secondarySet.tempSpeakerObjects);
         copySelected(e, true);
         if (!currentRegions || currentRegions.length < 1) { // overdub single
            handleSameSpeakerOverlap(getCurrentRegionIndex(), destinationSet, true);
         } else { // overdub multiple
            for (const item of getCurrentRegionsIndexes().reverse()) { // reverse indexes so index doesn't break when regions are removed
               handleSameSpeakerOverlap(item, destinationSet, true);
            }
         }
         if (destinationSet.isSecondary) primarySet.tempSpeakerObjects = backup; 
         else secondarySet.tempSpeakerObjects = backup;
         addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "overdub", getCurrentRegionIndex());
         reloadRegionsAndChapters();
      }
   }

   function copySelected(e, skipUndoState) { // copies region to opposite set [utility function for replace and overdub]
      if (!e.target.classList.contains('disabled')) {
         let destinationSet = secondarySet; // copy down
         if (currSpeakerSet.isSecondary) destinationSet = primarySet // copy up
            const selectedRegion = currentRegion;
         if (currentRegions && currentRegions.length > 1) { // copy multiple
            destinationSet.tempSpeakerObjects.push(...selectedRegions); // append current regions to dest. set
            // currSpeakerSet.isSecondary ? caretClicked("primary-caret") : caretClicked("secondary-caret"); // swap selected speakerSet (clears current regions)
            // for (const reg of destinationSet.tempSpeakerObjects) { // restore currentRegions in dest. set
            //    for (const selReg of selectedRegions) {
            //       if (regionsMatch(reg, selReg) && !containsRegion(currentRegions, reg)) { 
            //          currentRegions.push(reg);
            //       }
            //    }
            //    if (regionsMatch(reg, selectedRegion)) { currentRegion = reg; }
            // }
         } else { // copy singular
            destinationSet.tempSpeakerObjects.push(selectedRegion); // append current region to dest. set
            // currSpeakerSet.isSecondary ? caretClicked("primary-caret") : caretClicked("secondary-caret"); // swap selected speakerSet (clears current regions)
            // for (const reg of destinationSet.tempSpeakerObjects) { // restore currentRegion in dest. set
            //    if (regionsMatch(reg, selectedRegion)) { 
            //       currentRegion = reg; 
            //       break; 
            //    }
            // }
         }
         reloadRegionsAndChapters();
         if (!skipUndoState) addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "copy", getCurrentRegionIndex());
      }
   }

   /**
    * Shows context menu with various region options
    * @param {MouseEvent} e Either right click event or left click triple menu click event 
    */
   function onRightClick(e) {
      if ((e.target.classList.contains("wavesurfer-region") || e.target.id === "audioContainer" || e.target.classList.contains("chapter")) && editMode) {
         e.preventDefault();
         e.stopPropagation();
         let clickedRegion; // could be used to select clicked region
         for (const reg of currSpeakerSet.tempSpeakerObjects) {
            if (reg.region.element.title == e.target.title) {
               clickedRegion = reg;
               break;
            }
         }
         contextMenu.classList.add("visible");
         if (e.clientX + 200 > $(window).width()) contextMenu.style.left = ($(window).width() - 220) + "px"; // ensure menu doesn't clip on right
         else contextMenu.style.left = e.clientX + "px";
         contextMenu.style.top = e.clientY + "px";

         let lockConflict = false;
         let selectionContainsConflict = false;
         if (currentRegions.length > 1) {
            let firstIsLocked = 0;
            for (const reg of currentRegions) {
               if (firstIsLocked === 0) firstIsLocked = reg.locked;
               else if (firstIsLocked != reg.locked) lockConflict = true;
               if (reg.speaker.includes("conflict")) selectionContainsConflict = true;
            }
         }
         if (lockConflict) {
            contextLock.classList.remove('disabled');
            if (!document.getElementById("context-menu-lock-2")) {
               let contextLock2 = contextLock.cloneNode();
               contextLock.innerText = "Lock Selected";
               contextLock2.innerText = "Unlock Selected";
               contextLock2.id = "context-menu-lock-2";
               contextLock2.addEventListener('click', toggleLockSelected);
               contextLock.parentNode.insertBefore(contextLock2, contextLock.nextSibling);
            }
         } else {
            contextLock.classList.remove('disabled');
            let currIndex = getCurrentRegionIndex();
            if (currSpeakerSet.tempSpeakerObjects[currIndex] && currSpeakerSet.tempSpeakerObjects[currIndex].locked) {
               contextLock.innerText = "Unlock Selected";
               chapters.childNodes[currIndex].childNodes[1].classList.remove('hide');  
            } else if (currSpeakerSet.tempSpeakerObjects[currIndex]) {
               contextLock.innerText = "Lock Selected";
               chapters.childNodes[currIndex].childNodes[1].classList.add('hide');
            } 
         }

         if (dualMode && currentRegion && currentRegion.speaker !== "") {
            contextReplace.classList.remove('disabled');
            contextOverdub.classList.remove('disabled');
         } else {
            contextLock.classList.add('disabled');
            contextDelete.classList.add('disabled');
            contextDownload.classList.add('disabled');
            contextReplace.classList.add('disabled');
            contextOverdub.classList.add('disabled');
         }
         if (currentRegion && currentRegion.speaker !== "") {
            contextLock.classList.remove('disabled');
            contextDelete.classList.remove('disabled');
            if (currentRegions.length === 0) contextDownload.classList.remove('disabled');
         }
         if (selectionContainsConflict) { // TODO: needs work
            contextLock.classList.add('disabled');
         }
         if (dualMode) { // manipulate context texts
            const actionDirection = currSpeakerSet.isSecondary ? "Up" : "Down";
            contextReplace.innerHTML = "Replace Selected " + actionDirection;
            contextOverdub.innerHTML = "Overdub Selected " + actionDirection;
         } 
      }
   }

   function saveSelected(e) {
      let csvContent = "data:text/csv;charset=utf-8," + currSpeakerSet.speakerObjects.map(item => "\n" + [item.speaker, item.start, item.end].join());
      console.log(csvContent);
      var encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
   }

   function keyUp(e) { // key up listener
      if (e.key == "Control") ctrlDown = false;
      if (e.target.tagName !== "INPUT") {
         if (e.code === "Backspace" || e.code === "Delete") removeRegion();
         else if (e.code === "Space") { wavesurfer.playPause(); }
         else if (e.code === "ArrowLeft") wavesurfer.skipBackward();
         else if (e.code === "ArrowRight") wavesurfer.skipForward();
         else if (e.code === "KeyL") toggleLockSelected(e);
      }
      if (e.code == "KeyZ" && e.ctrlKey) undo();
      else if (e.code == "KeyY" && e.ctrlKey) redo();
   }

   function keyDown(e) { // keydown listener
      if (e.key == "Control") ctrlDown = true;
      if (e.code == "Space" && e.target.tagName.toLowerCase() != "input") e.preventDefault();
   }

   /**
   * Shows / hides secondary speaker set
   * @param skipUndoState Utility param - skips the addition of an undo state
   * @param overrideValue Utility param - overrides the checkbox state
   */
   function dualModeChanged(skipUndoState, overrideValue) {
      if (overrideValue) dualModeCheckbox.checked = overrideValue == "true" ? true : false;
      else dualModeCheckbox.checked = !dualModeCheckbox.checked; // toggle dual mode checkbox
      dualMode = dualModeCheckbox.checked; 
      currSpeakerSet = primarySet;
      if (!dualMode) removeCurrentRegion();
      setChapterSearch("");
      reloadRegionsAndChapters();
      if (dualMode && previousVersionsExist) {  
         if (!secondaryLoaded && !initialLoad) {
            const secondaryCSVURL = gs.variables.metadataServerURL + "?a=get-archives-assocfile&site=" + gs.xsltParams.site_name + "&c=" + gs.collectionMetadata.indexStem + 
                                    "&d=" + gs.documentMetadata.Identifier + "&assocname=structured-audio.csv&dv=nminus-1";
            loadCSVFile(secondaryCSVURL, secondarySet);
            secondaryLoaded = true; // ensure secondarySet doesn't get re-read > once
         }
         document.getElementById("caret-container").style.display = "flex";
         timelineMenuRegionConflict.classList.remove("disabled");
         timelineMenuSpeakerConflict.classList.remove("disabled");
         timelineMenuMerge.classList.remove("disabled");
         $('#track-set-label-bottom').fadeIn(100);
         selectedVersions[1] = document.getElementById('track-set-label-bottom').children[0].innerText;
      } else {
         caretClicked('primary-caret');
         document.getElementById("caret-container").style.display = "none";
         selectedVersions.splice(1, 1); // trim to one version in array
         timelineMenuRegionConflict.firstElementChild.checked = false;
         timelineMenuSpeakerConflict.firstElementChild.checked = false;
         timelineMenuRegionConflict.classList.add("disabled");
         timelineMenuSpeakerConflict.classList.add("disabled");
         timelineMenuMerge.classList.add("disabled");
         $('#track-set-label-bottom').fadeOut(100);
      }
      currSpeakerSet = primarySet;
      if (!skipUndoState) addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "dualModeChange", getCurrentRegionIndex());
   } 

   /**
   * Changes selected speaker set
   * @param {string} id ID of clicked caret image
   */
   function caretClicked(id) {
      setChapterSearch("");
      if (id === "primary-caret") {
         currSpeakerSet = primarySet;
         swapCarets(true);
      } else if (id === "secondary-caret") {
         currSpeakerSet = secondarySet;
         swapCarets(false);
      }
   }

   /**
   * Loads destination waveform and audio if required, updates caret images
   * @param {boolean} toPrimary whether destination set is primary (true) or secondary (false)
   */
   function swapCarets(toPrimary) {
      const currCaretIsPrimary = primaryCaret.src.includes("fill") ? true : false; // initial value before swap
      if ((toPrimary && !currCaretIsPrimary) || (!toPrimary && currCaretIsPrimary)) { 
         removeCurrentRegion(); // ensure currentRegion is only removed if changing speakerSet
         flashChapters(); 
         reloadChapterList();
      } 
      if (toPrimary) {
         if (!currCaretIsPrimary) {
            showAudioLoader();
            if (canvasImages[selectedVersions[0]]) { // if waveform image exists in cache
               drawImageOnWaveform(canvasImages[selectedVersions[0]]);
               // hideAudioLoader();
            } 
            // else showAudioLoader();
            let url = gs.variables.metadataServerURL + "?a=get-archives-assocfile&site=" + gs.xsltParams.site_name + 
                        "&c=" + gs.cgiParams.c + "&d=" + gs.cgiParams.d + "&assocname=" + gs.documentMetadata.Audio;
            if (selectedVersions[0] !== "current") {
               if (selectedVersions[0].includes("Previous")) url += "&dv=" + selectedVersions[0].replace("Previous(", "nminus-").replace(")", "");
               else url += "&dv=" + selectedVersions[0];
            }
            wavesurfer.load(url); 
         }
         primaryCaret.src = interface_bootstrap_images + "caret-right-fill.svg";
         secondaryCaret.src = interface_bootstrap_images + "caret-right.svg";
      } else {
         if (currCaretIsPrimary) {
            showAudioLoader();
            if (canvasImages[selectedVersions[1]]) { 
               drawImageOnWaveform(canvasImages[selectedVersions[1]]);
               // hideAudioLoader();
            } 
            // else showAudioLoader();
            let url = gs.variables.metadataServerURL + "?a=get-archives-assocfile&site=" + gs.xsltParams.site_name + 
                        "&c=" + gs.cgiParams.c + "&d=" + gs.cgiParams.d + "&assocname=" + gs.documentMetadata.Audio;
            if (selectedVersions[1] !== "current") {
               if (selectedVersions[1].includes("Previous")) url += "&dv=" + selectedVersions[1].replace("Previous(", "nminus-").replace(")", "");
               else url += "&dv=" + selectedVersions[1];
            }
            wavesurfer.load(url); 
         }
         primaryCaret.src = interface_bootstrap_images + "caret-right.svg";
         secondaryCaret.src = interface_bootstrap_images + "caret-right-fill.svg";
      }
   }

   /**
   * Shows spinning loader over waveform, hides regions
   */
   function showAudioLoader() {
      $('.wavesurfer-region').fadeOut(100);
      $(".chapter").fadeOut(100);
      $(".track-set-label").fadeOut(100);
      waveformSpinner.style.display = 'block';
      loader.style.display = "inline";
      for (const ele of editPanel.children) ele.classList.add("disabled");
      playPauseButton.classList.add("disabled");
   }

   /**
   * Hides spinning loader, brings back regions
   */
   function hideAudioLoader() {
      $('.wavesurfer-region').fadeIn(100);
      $(".chapter").fadeIn(100);
      if (gs.variables.allowEditing !== "0") {
         $("#track-set-label-top").fadeIn(100);
         if (dualMode) $('#track-set-label-bottom').fadeIn(100);
      }
      waveformSpinner.style.display = 'none';
      loader.style.display = "none";
      for (const ele of editPanel.children) ele.classList.remove("disabled");
      updateRegionEditPanel();
      playPauseButton.classList.remove("disabled");
   }

   /**
   * Draws given image URL on waveform 
   * @param image URL of image to be drawn
   */
   function drawImageOnWaveform(image) {
      // console.log('draw waveform image from cache')
      if (document.getElementById('new-canvas')) document.getElementById('new-canvas').remove();
      var newCanvas = document.createElement("div");
      newCanvas.id = "new-canvas";
      newCanvas.style.width = wavesurfer.drawer.canvases[0].wave.width + 'px';
      newCanvas.style.height = waveformHeight + 'px';
      newCanvas.style.backgroundImage = "url('" + image + "')";
      waveformContainer.appendChild(newCanvas); 
   }

   /**
   * Regenerates chapter list to update any changes made in speakerSet
   */
   function reloadChapterList() { 
      chapters.innerHTML = "";
      for (let i = 0; i < currSpeakerSet.tempSpeakerObjects.length; i++) {
         let chapter = document.createElement("div"); 
         chapter.classList.add("chapter");
         chapter.id = "chapter" + i;
         let speakerName = document.createElement("span");
         speakerName.classList.add("speakerName");
         speakerName.innerText = currSpeakerSet.tempSpeakerObjects[i].speaker;
         let regionLocked = document.createElement("img");
         regionLocked.src = interface_bootstrap_images + "lock.svg"; 
         regionLocked.classList.add("speakerLocked", "hide"); 
         attachPadlockListener(regionLocked, currSpeakerSet.tempSpeakerObjects[i].region, true);
         if (currSpeakerSet.tempSpeakerObjects[i].locked && editMode) regionLocked.classList.remove("hide");
         let speakerTime = document.createElement("span"); 
         speakerTime.classList.add("speakerTime"); 
         speakerTime.innerHTML = minutize(currSpeakerSet.tempSpeakerObjects[i].start) + " - " + minutize(currSpeakerSet.tempSpeakerObjects[i].end) + "s";
         chapter.appendChild(speakerName);
         chapter.appendChild(regionLocked);
         chapter.appendChild(speakerTime);
         chapter.addEventListener("click", chapterClicked);
         chapter.addEventListener("mouseenter", e => { chapterEnter(Array.from(e.target.parentElement.children).indexOf(e.target)) });
         chapter.addEventListener("mouseleave", e => { chapterLeave(Array.from(e.target.parentElement.children).indexOf(e.target)) });
         if (chapterSearchInput.value.length > 0 && !speakerName.innerText.toLowerCase().includes(chapterSearchInput.value.toLowerCase())) {
            chapter.style.display = "none";
            currSpeakerSet.tempSpeakerObjects[i].region.element.style.display = "none";
         }
         chapters.appendChild(chapter);
      }
   }

   /**
   * Shows / hides chapter section
   */
   let toggleChapters = function() {
      if (chapters.style.height == "0px") {
         chapters.style.height = "90%";
         chaptersContainer.style.height = "30vh";
         chapterSearchInput.placeholder = "Filter by Name...";
      } else {
         chapters.style.height = "0px";
         chaptersContainer.style.height = "0px";
         chapterSearchInput.placeholder = "";
      }
   }

   /**
   * Object representing elements of a diarization output
   * @param {boolean} isSecondary Whether or not the set is secondary/bottom (true) or primary/top (false)
   * @param {Array} uniqueSpeakers Array of all unique speaker names within the diarization data, used for colouring regions
   * @param {Array} speakerObjects Array of objects containing speaker start/stop times and names
   * @param {Array} tempSpeakerObjects Temporary version of speakerObjects, which can be reverted back to if required 
   */
   function SpeakerSet(isSecondary, uniqueSpeakers, speakerObjects, tempSpeakerObjects) {
      this.isSecondary = isSecondary;
      this.uniqueSpeakers = uniqueSpeakers;
      this.speakerObjects = speakerObjects;
      this.tempSpeakerObjects = tempSpeakerObjects;
   }

   let primarySet = new SpeakerSet(false, [], [], [], []);
   let secondarySet = new SpeakerSet(true, [], [], [], []);
   let currSpeakerSet = primarySet;

   /**
   * Reads diarization CSV file and populates speakerSet
   * @param {string} filename Source destination of input CSV file
   * @param {object} speakerSet speaker set to be populated
   * @param {boolean} forcePopulate Forces redraw of regions and chapters
   */
   function loadCSVFile(filename, speakerSet, forcePopulate) { // based on: https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
      $.ajax({
         type: "GET",
         url: filename,
         dataType: "text",
      }).then(data => {
         if (data.includes("ERROR")) {
            console.log("loadCSVFile Error: " + data);
         } else {
            let dataLines = data.split(/\r\n|\n/);
            let headers;
            let startIndex = 0;
            speakerSet.uniqueSpeakers = []; // used for obtaining unique colours
            speakerSet.speakerObjects = []; // list of speaker items

            if (dataLines[0].split(',').length === 3) headers = ["speaker", "start", "end"]; // assume speaker, start, end
            else if (dataLines[0].split(',').length === 4) headers = ["speaker", "start", "end", "locked"]; // assume speaker, start, end, locked
            else headers = ["speaker", "start", "end", "locked"]; // this is reached after commit where there are 6 cols: speaker, start, stop, dur_lock, spkr_loc, global_lock

            for (let i = startIndex; i < dataLines.length; i++) {
               let data = dataLines[i].split(',');
               if (data[0] !== "") {
                  let item = {};
                  for (let j = 0; j < headers.length; j++) {
                     item[headers[j]] = data[j];
                     if (j == 0 && !speakerSet.uniqueSpeakers.includes(data[j])) {
                        speakerSet.uniqueSpeakers.push(data[j]);
                     }
                  }
                  if (headers.length === 3) item['locked'] = false;
                  if ((item.end - item.start) > longestDuration) {
                     longestDuration = item.end - item.start;
                  }
                  speakerSet.speakerObjects.push(item);
               }
            }
            longestDuration = Math.ceil(longestDuration);
            chapterFilterMax.max = longestDuration;
            chapterFilterMin.max = longestDuration;
            chapterFilterMax.value = longestDuration;
            document.getElementById("filter-max-label").innerText = minutize(longestDuration, true) + "s";
            speakerSet.tempSpeakerObjects = cloneSpeakerObjectArray(speakerSet.speakerObjects);
            populateChaptersAndRegions(speakerSet); // draw on waveform
            // if (!speakerSet.isSecondary || forcePopulate) populateChaptersAndRegions(speakerSet); // prevents secondary set being drawn on first load
            resetUndoStates(); // undo stack init
            checkCSVForConflict(selectedVersions[speakerSet.isSecondary ? 1 : 0], data); 
         }
      }, (error) => { console.log("loadCSVFile Error:"); console.log(error); });
   }

   /**
   * Populates chapter list div and regions on waveform with given speaker set
   * @param {object} data Speaker set object with diarization data
   */
   function populateChaptersAndRegions(data) {
      // colorbrewer is a web tool for guidance in choosing map colour schemes based on a letiety of settings.
      // this colour scheme is designed for qualitative data
      if (regionColourSet.length < 1) {
         for (let i = 0; i < data.uniqueSpeakers.length; i++) { // not tested in cases where there are more than 8 speakers!!
            const adjIdx = i%8;
            regionColourSet[adjIdx] = { name: data.uniqueSpeakers[i], colour: colourbrewerSet[adjIdx] }
         }
      }

      let isSelectedSet = false;

      if ((!data.isSecondary && primaryCaret.src.includes("fill")) || (data.isSecondary && secondaryCaret.src.includes("fill"))) isSelectedSet = true;
      data.tempSpeakerObjects = sortSpeakerObjectsByStart(data.tempSpeakerObjects); // sort speakerObjects by start time
      if (isSelectedSet || !dualMode) chapters.innerHTML = ""; // clear chapter div for re-population
      for (let i = 0; i < data.tempSpeakerObjects.length; i++) {
         let chapter = document.createElement("div"); 
         chapter.classList.add("chapter");
         chapter.id = "chapter" + i;
         let speakerName = document.createElement("span");
         speakerName.classList.add("speakerName");
         speakerName.innerText = data.tempSpeakerObjects[i].speaker;
         let regionLocked = document.createElement("img");
         regionLocked.src = interface_bootstrap_images + "lock.svg"; 
         regionLocked.classList.add("speakerLocked", "hide"); 
         attachPadlockListener(regionLocked, data.tempSpeakerObjects[i].region, true);
         if (data.tempSpeakerObjects[i].locked && editMode) regionLocked.classList.remove("hide");
         let speakerTime = document.createElement("span"); 
         speakerTime.classList.add("speakerTime"); 
         speakerTime.innerHTML = minutize(data.tempSpeakerObjects[i].start) + " - " + minutize(data.tempSpeakerObjects[i].end) + "s";
         chapter.appendChild(speakerName);
         chapter.appendChild(regionLocked);
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

         let regColour;
         if (regionColourSet.find(item => item.name === data.tempSpeakerObjects[i].speaker)) {
            regColour = regionColourSet.find(item => item.name === data.tempSpeakerObjects[i].speaker).colour;
         } else {
            regionColourSet.push({ name: data.tempSpeakerObjects[i].speaker, colour: colourbrewerSet[(i+1)%8]});
            regColour = regionColourSet.at(-1).colour;
         }

         let associatedReg = wavesurfer.addRegion({ // create associated wavesurfer region
            id: "region" + i,
            start: data.tempSpeakerObjects[i].start,
            end: data.tempSpeakerObjects[i].end,
            drag: editMode,
            resize: editMode,
            attributes: {
               label: speakerName,
            },
            color: regColour + regionTransparency,
            // ...(selected) && {color: "rgba(255,50,50,0.5)"}, // removed for readability
         });
         if (selected) associatedReg.color = "rgba(255,50,50,0.5)";
         data.tempSpeakerObjects[i].region = associatedReg;

         if (editMode && data.tempSpeakerObjects[i].speaker.includes("conflict")) { 
            drawConflictMarker(associatedReg.element); // draw conflict icon on region
         }
         if (selected) { // show padlock and menu button if region is selected
            drawRegionMenuButton(associatedReg);
            if (data.tempSpeakerObjects[i].locked) { // add padlock to regions if they are selected and locked
               let lock = drawPadlock(associatedReg.element);
               attachPadlockListener(lock, associatedReg, false);
            }
         }
      }
      if (waveformSpinner.style.display == 'block') $(".wavesurfer-region").fadeOut(100); // keep regions hidden until wavesurfer.load() has finished
      let handles = document.getElementsByTagName('handle');
      for (const handle of handles) handle.addEventListener('mousedown', () => mouseDown = true);

      let regions = document.getElementsByTagName("region");
      if (dualMode) {
         if (document.getElementsByClassName("region-top").length == 0) {
            for (const reg of regions) {
               if (reg.classList.length == 1) reg.classList.add("region-top"); 
            }
         } else {
            for (const rego of regions) {
               if (!rego.classList.contains("region-top") && rego.classList.length == 1) rego.classList.add("region-bottom");
            }
         }
      }
      if (editMode) for (const reg of regions) reg.style.setProperty("z-index", "3", "important");
      else for (const reg of regions) reg.style.setProperty("z-index", "1", "important");

      chapterSearchInput.dispatchEvent(new Event("input"));
      updateChapterConflictIcons();
   }

   function loadJSONFile(filename) {
      $.ajax({
         type: "GET",
         url: filename,
         dataType: "text",
      }).then(function(data){ populateWords(JSON.parse(data)) }, (error) => { console.log("loadJSONFile error:"); console.log(error); });
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
      if (currSpeakerSet.tempSpeakerObjects[index]) {
         let clickedRegion = currSpeakerSet.tempSpeakerObjects[index].region;
         handleRegionClick(clickedRegion, e); 
      }
   }

   function wordClicked(data, id) { // plays audio from start of word
      let index = id.replace("word", "");
      let start = data.words[index].startTime;
      wavesurfer.play(start);
   }

   function chapterEnter(idx) {
      let reg = currSpeakerSet.tempSpeakerObjects[idx].region;
      regionEnter(reg);
      setHoverSpeaker(reg.element.style.left, reg.attributes.label.innerText);
      if (!isInCurrentRegions(reg)) {
         removeRegionBounds();
         drawRegionBounds(reg, wave.scrollLeft, "black");
      }
   }

   function chapterLeave(idx) {
      regionLeave(currSpeakerSet.tempSpeakerObjects[idx].region);
      removeRegionBounds();
      hoverSpeaker.innerHTML = "";
      if (currentRegion.speaker && getCurrentRegionIndex() != -1) { 
         setHoverSpeaker(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left, currentRegion.speaker);
         drawCurrentRegionBounds();
      } 
   }
   /**
   * Handles region and chapter colours
   * @param {object} region Region element to adjust
   * @param {boolean} highlight Whether or not region should be white-highlighted
   */
   function handleRegionColours(region, highlight) { // handles region, chapter & word colours
      if (!dualMode || (region.element.classList.contains("region-top") && primaryCaret.src.includes("fill")) || region.element.classList.contains("region-bottom") && secondaryCaret.src.includes("fill")) {
         let colour;
         if (highlight) {
            colour = "rgb(81, 90, 90)";
            regionEnter(region);
         } else {
            colour = "";
            regionLeave(region);
         }
         if (isCurrentRegion(region) || isInCurrentRegions(region)) {
            colour = "rgba(255, 50, 50, 0.5)";
            if (editMode && region.element.getElementsByClassName("region-menu").length == 0) {
               drawRegionMenuButton(region);
            }
         }
         if (chapters.childNodes[getIndexOfRegion(region)]) {
            chapters.childNodes[getIndexOfRegion(region)].style.backgroundColor = colour;
         }
      }
   }

   function regionEnter(region) {
      if (isCurrentRegion(region) || isInCurrentRegions(region)) {
         region.update({ color: "rgba(255, 50, 50, 0.5)" });
         console.log('regionEnter: set to red')
      } else {
         region.update({ color: "rgba(255, 255, 255, 0.3)" });
         console.log('regionEnter: set to grey')
      }
      const currRegion = currSpeakerSet.tempSpeakerObjects[getIndexOfRegion(region)];
      if (editMode && currRegion) {
         if (currRegion.locked && region.element.getElementsByClassName("region-padlock").length == 0) { // hovered region is locked
            let lock = drawPadlock(region.element);
            attachPadlockListener(lock, region, false);
         }
         if (currRegion.speaker.includes("conflict") && region.element.getElementsByClassName("region-conflict").length == 0) {
            drawConflictMarker(region.element);
         }
      }
   }

   function regionLeave(region) { 
      if (itemType == "chapter" && region) {
         if (isCurrentRegion(region) || isInCurrentRegions(region)) {
            region.update({ color: "rgba(255, 50, 50, 0.5)" });
         // } else if (!(wavesurfer.getCurrentTime() + 0.1 < region.end && wavesurfer.getCurrentTime() > region.start)) {
         } else {
            let index = region.id.replace("region", "");
            if (regionColourSet.find(item => item.name === currSpeakerSet.tempSpeakerObjects[index].speaker)) {
               region.update({ color: regionColourSet.find(item => item.name === currSpeakerSet.tempSpeakerObjects[index].speaker).colour + regionTransparency });
               console.log('regionLeave: set to existing colour')
            } else {
               regionColourSet.push({ name: currSpeakerSet.tempSpeakerObjects[index].speaker, colour: colourbrewerSet[(index+1)%8]});
               region.update({ color: regionColourSet.at(-1).colour + regionTransparency });
               console.log('regionLeave: set to new colour')
            }
         }
         if (region.element.getElementsByTagName("img").length > 0 && !isCurrentRegion(region) && !isInCurrentRegions(region)) {
            for (let child of Array.from(region.element.children)) {
               if (child.tagName == "IMG" && !child.classList.contains("region-conflict")) {
                  child.remove();
               }
            }
         }
      } else if (region) {
         region.update({ color: "rgba(255, 255, 255, 0.1)" });
         console.log('regionLeave: set to dark grey')
      }
   }

   function minutize(num, trimLeadingZeros) { // converts seconds to m:ss for chapters & waveform hover
      let date = new Date(null);
      date.setSeconds(num);
      date = date.toTimeString().split(" ")[0].substring(3);
      if (trimLeadingZeros && date.startsWith("00")) date = date.slice(3);
      return date;
   }

   function formatCursor(num) {
      cursorPos = num;
      return minutize(num);
   }

   function getLetter(val) {
      let speakerNum = parseInt(val.replace("SPEAKER_",""));
      return String.fromCharCode(65 + speakerNum); // 'A' == UTF-16 65
   }

   function toggleEditMode(skipDualModeToggle) { // toggles edit panel and redraws regions with resize handles
      if (gs.variables.allowEditing === '1') {
         toggleEditPanel();
         updateRegionEditPanel();
         reloadChapterList();
      }
   }

   function toggleVersionDropdown(e) {
      e.stopPropagation();
      if (versionSelectMenu.classList.contains("visible")) {
         e.target.style.display = 'inline';
         versionSelectMenu.classList.remove("visible");
      }
      else {
         e.target.style.display = 'none';
         versionSelectMenu.classList.add("visible");
         versionSelectMenu.style.top = "2rem";
         versionSelectMenu.style.height = wave.clientHeight + wavesurfer.timeline.container.clientHeight + document.getElementById("audio-toolbar").clientHeight - 6 + "px";
         if (e.target.parentElement.id.includes("top")) versionSelectMenu.classList.add("versionTop");
         else versionSelectMenu.classList.remove("versionTop");
         for (version of versionSelectMenu.children) { // handle disabling of regions if being viewed
            if (selectedVersions.includes(version.id) || selectedVersions.includes(version.innerText)) version.classList.add('disabled');
            else version.classList.remove('disabled');
         }
      }
   }

   function toggleEditPanel() { // show & hide edit panel
      removeCurrentRegion();
      hoverSpeaker.innerHTML = "";
      if (editPanel.style.height == "0px") {
         if (chapters.style.height == "0px") toggleChapters(); // expands chapter panel
         editPanel.style.height = "30vh";
         editPanel.style.padding = "0.5rem";
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
      $('.wavesurfer-region').hide();
      reloadRegionsAndChapters(); // editMode sets drag/resize property when regions are redrawn
   }

   /**
   * Handles the edit of region start time, stop time, or speaker name, updating the speaker set
   * @param {object} region Region that has been updated
   */
   function handleRegionEdit(region, e) { 
      if (region.element.classList.contains("region-bottom")) { currSpeakerSet = secondarySet; swapCarets(false) }
      else { currSpeakerSet = primarySet; swapCarets(true) }
      editsMade = true;
      currentRegion = region;
      wavesurfer.backend.seekTo(region.start);
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
      editLockedRegion(currSpeakerSet.tempSpeakerObjects[regionIndex], chaps); 

      editPanel.click(); // fixes buttons needing to be clicked twice (unknown cause!)
   }

   /**
   * Shows popup to ensure user is aware they are editing a locked region
   * @param {object} region Region that is being edited
   */
   function editLockedRegion(region) { // ensures user is aware region being edited is locked
      if (region.locked) {
         let confirm = false;
         confirm = window.confirm("Editing a locked region will unlock it, are you sure you want to continue?"); 
         if (!confirm) undo(); // undo change if no
         else { // remove lock if yes
            region.locked = false; 
            if (region.region && region.region.element.firstChild) region.region.element.firstChild.remove(); // remove region padlock
            if (chapters.childNodes[getCurrentRegionIndex()] && chapters.childNodes[getCurrentRegionIndex()].childNodes[1].tagName === "IMG") {
               chapters.childNodes[getCurrentRegionIndex()].childNodes[1].classList.add('hide'); // remove chapter padlock
            }
         }
      }
   }

   /**
   * Merges same-speaker regions with overlapping bounds
   * @param {int} regionIdx Index of dragged/edited region
   * @param {object} speakerSet Speaker set dragged region exists in 
   * @param {boolean} skipCurrentRegionUpdate Whether or not to skip the updating of current region
   */
   function handleSameSpeakerOverlap(regionIdx, speakerSet, skipCurrentRegionUpdate) {
      let draggedRegion = speakerSet.tempSpeakerObjects[regionIdx]; // regionIdx may point to a different region within the for-loop after adjustments, so defined here
      let draggedRegionSpeaker = draggedRegion.speaker;
      for (let i = 0; i < speakerSet.tempSpeakerObjects.length; i++) {
         if (speakerSet.tempSpeakerObjects[i].speaker === draggedRegionSpeaker && !regionsMatch(draggedRegion, speakerSet.tempSpeakerObjects[i])) { // ensure speaker name match
            if (parseFloat(speakerSet.tempSpeakerObjects[i].start) <= parseFloat(draggedRegion.end) && parseFloat(draggedRegion.start) <= parseFloat(speakerSet.tempSpeakerObjects[i].end)) { // ensure overlap
               draggedRegion.start = Math.min(speakerSet.tempSpeakerObjects[i].start, draggedRegion.start);
               draggedRegion.end = Math.max(speakerSet.tempSpeakerObjects[i].end, draggedRegion.end);
               draggedRegion.region.update({start: Math.min(speakerSet.tempSpeakerObjects[i].start, draggedRegion.start), end: Math.max(speakerSet.tempSpeakerObjects[i].end, draggedRegion.end)});
               if (!skipCurrentRegionUpdate) currentRegion = draggedRegion;
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

   /**
   * Updates the edit panel elements based on various editing states
   */
   function updateRegionEditPanel() { 
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
         if (!isZooming) { changeAllCheckbox.disabled = false; }
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

   /**
   * Adds a new region to the waveform at the current caret location with the speaker name "NEW_SPEAKER"
   */
   function createNewRegion() { // adds a new region to the waveform
   console.log(currSpeakerSet.tempSpeakerObjects)
      setChapterSearch("");
      const speaker = "NEW_SPEAKER"; // default name
      if (!currSpeakerSet.uniqueSpeakers.includes(speaker)) { currSpeakerSet.uniqueSpeakers.push(speaker) }
      const start = newRegionOffset + wavesurfer.getCurrentTime();
      const end = newRegionOffset + wavesurfer.getCurrentTime() + 15;
      newRegionOffset += 5; // offset new region if multiple new regions are created. 
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

   /**
   * Removes the currently selected region or regions
   */
   function removeRegion() { 
      if (!removeButton.classList.contains("disabled")) {
         if (getCurrentRegionIndex() != -1) { // if currentRegion has been set 
            let currentRegionIndex = getCurrentRegionIndex();
            let currentRegionIndexes = getCurrentRegionsIndexes();
            let lockTemplate = { locked: currSpeakerSet.tempSpeakerObjects[currentRegionIndex].locked };
            for (let i = 0; i < currSpeakerSet.tempSpeakerObjects.length; i++) {
               if (isCurrentRegion(currSpeakerSet.tempSpeakerObjects[i].region)) {
                  currSpeakerSet.tempSpeakerObjects[i].region.remove();
                  currSpeakerSet.tempSpeakerObjects.splice(i, 1); // remove from tempSpeakerObjects
                  editsMade = true;
                  if (i >= 0) i--; // decrement index for side-by-side regions
                  if (!changeAllCheckbox.checked && currentRegions.length < 1) {
                     removeCurrentRegion();
                     addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "remove", currentRegionIndex);
                     updateRegionEditPanel();
                     reloadChapterList();
                     editLockedRegion(lockTemplate);
                     return; // jump out of function
                  }
               } else if (isInCurrentRegions(currSpeakerSet.tempSpeakerObjects[i])) { 
                  currSpeakerSet.tempSpeakerObjects[i].region.remove();
                  currSpeakerSet.tempSpeakerObjects.splice(i, 1);
                  if (i >= 0) i--;
               }
            }
            removeCurrentRegion();
            addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "remove", currentRegionIndex, currentRegionIndexes); // multiple regions removed
            updateRegionEditPanel();
            reloadChapterList();
            editLockedRegion(lockTemplate);
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

   function updateUniqueSpeakers() {
      currSpeakerSet.uniqueSpeakers = [];
      for (const reg of currSpeakerSet.tempSpeakerObjects) {
         if (!currSpeakerSet.uniqueSpeakers.includes(reg.speaker)) currSpeakerSet.uniqueSpeakers.push(reg.speaker);
      }
   }

   /**
   * Changes the associated speaker name of a region, updating the speaker set
   */
   function speakerChange() {
      const newSpeaker = speakerInput.value;
      setChapterSearch("");
      if (newSpeaker && newSpeaker.trim() != "") {
         speakerInput.style.outline = "2px solid transparent";
         if (getCurrentRegionIndex() != -1) { // if a region is selected
            const chaps = chapters.childNodes;
            if (!currSpeakerSet.uniqueSpeakers.includes(newSpeaker)) { currSpeakerSet.uniqueSpeakers.push(newSpeaker) }
            if (currentRegions && currentRegions.length < 1) {  // single change
               currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].speaker = newSpeaker; // update corrosponding speakerObject speaker
               currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.attributes.label.innerText = newSpeaker;
               chaps[getCurrentRegionIndex()].firstChild.textContent = newSpeaker; // update chapter text
            } else if (currentRegions && currentRegions.length > 1) { // multiple changes
               for (idx of getCurrentRegionsIndexes()) {
                  currSpeakerSet.tempSpeakerObjects[idx].speaker = newSpeaker;
                  currSpeakerSet.tempSpeakerObjects[idx].region.attributes.label.innerText = newSpeaker;
                  chaps[idx].firstChild.textContent = newSpeaker;
               }
            } 
            currentRegion.speaker = newSpeaker;
            chapterLeave(getCurrentRegionIndex()); // update region bound text
            editsMade = true;
            addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "speaker-change", getCurrentRegionIndex(), getCurrentRegionsIndexes());
            editLockedRegion(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()]);
            let regElement = currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element;
            if (regElement.getElementsByClassName("region-conflict").length > 0 && !newSpeaker.includes("conflict")) {
               regElement.getElementsByClassName("region-conflict")[0].remove();
            } else if (regElement.getElementsByClassName("region-conflict").length == 0 && newSpeaker.includes("conflict")) {
               drawConflictMarker(regElement);
            }
            updateChapterConflictIcons();
            checkCSVForConflict(selectedVersions[currSpeakerSet.isSecondary ? 1 : 0], "", currSpeakerSet.tempSpeakerObjects);
            updateUniqueSpeakers();
         } else { console.log("no region selected") }
      } else { console.log("no text in speaker input"); speakerInput.style.outline = "2px solid firebrick"; }
   }

   function updateChapterConflictIcons() { // disabled: chapter names referenced in too many places to easily replace text with icons
      if (false) {
         document.querySelectorAll('.conflict-hover-icon').forEach(e => e.remove());
         for (const chap of chapters.childNodes) {
            const speakerName = chap.getElementsByClassName("speakerName")[0].innerText;
            if (speakerName.includes("dur_lock:")) {
               let img = document.createElement("img");
               img.className = "conflict-hover-icon";
               img.src = interface_bootstrap_images + "clock.svg";
               img.title = "This region represents a start/stop time conflict";
               chap.insertBefore(img, chap.childNodes[2]);
            }
            if (speakerName.includes("spkr_lock:")) {
               let img = document.createElement("img");
               img.className = "conflict-hover-icon";
               img.src = interface_bootstrap_images + "person.svg";
               img.title = "This region represents a speaker name conflict";
               chap.insertBefore(img, chap.childNodes[2]);
            }
            // chap.getElementsByClassName("speakerName")[0].innerText = speakerName.replace("dur_lock:", "").replace("spkr_lock:", "");
         }
      }
   }

   function speakerInputUnfocused() {
      prevUndoState = "";
      if (speakerInput.value == "" && !speakerInput.classList.contains("disabled")) {
         speakerInput.style.outline = "2px solid firebrick";
         window.alert("Speaker input cannot be left empty. Please enter a speaker name.");
         setTimeout(() => speakerInput.focus(), 10); // timeout needed otherwise input isn't selected
      } else speakerInput.style.outline = "2px transparent";
   }

   /**
   * Selects all (or reverts select-all) regions matching any of the currently selected speaker names
   * @param {boolean} skipUndoState Whether or not to skip the addition of an undo state
   */
   function selectAllCheckboxChanged(skipUndoState) { // "Change all" toggled
      if (changeAllCheckbox.checked) {
         // **** Have decided to suppress auto zoom out on select all
         // if (!isZooming) {
         //    tempZoomSave = zoomSlider.value;
         //    zoomTo(1); // zoom out to encompass all selected regions
         // }
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
         // **** Have decided to suppress auto zoom out on select all
         // if (!isZooming) {
         //    zoomTo(tempZoomSave / 4);  // zoom back in to previous level
         // }
         currentRegions = []; // this will lose track of previously selected region*s*
      }
      reloadRegionsAndChapters();
      if (!skipUndoState) addUndoState(primarySet, secondarySet, currSpeakerSet.isSecondary, dualMode, "selectAllChange", getCurrentRegionIndex(), getCurrentRegionsIndexes());
   }

   function enableStartEndInputs() { // removes the 'disabled' tag from all time inputs
      for (idx in startTimeInput.childNodes) { startTimeInput.childNodes[idx].disabled = false }
      for (idx in endTimeInput.childNodes) { endTimeInput.childNodes[idx].disabled = false }
   }

   function disableStartEndInputs() { // adds the 'disabled' tag to all time inputs
      for (idx in startTimeInput.childNodes) { startTimeInput.childNodes[idx].value = 0; startTimeInput.childNodes[idx].disabled = true; }
      for (idx in endTimeInput.childNodes) { endTimeInput.childNodes[idx].value = 0; endTimeInput.childNodes[idx].disabled = true; }
   }

   /**
   * Zooms wavesurfer waveform to destination zoom level, used in select all function
   * @param {number} dest Destination zoom level
   */
   function zoomTo(dest) { 
      isZooming = true;
      changeAllCheckbox.disabled = true;
      let isOut = false;
      if (dest == 0) isOut = true;
      zoomInterval = setInterval(() => {
         const sliderValue = Number(zoomSlider.value) / 4;
         if (isOut) {
            if (zoomSlider.value > 1) {
               if (zoomSlider.value > 50) zoomSlider.value -= 30; // ramp up for finer adjustments
               else zoomSlider.stepDown(); 
               wavesurfer.zoom(sliderValue > 1 ? (sliderValue / 4) : 1); // ensure value is greater than 1
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
               wavesurfer.zoom(sliderValue > 1 ? (sliderValue / 4) : 1); // ensure value is greater than 1
            } else {
               clearInterval(zoomInterval);
               isZooming = false;
               changeAllCheckbox.disabled = false;
               zoomSlider.dispatchEvent(new Event("input"));
            }
         }
      }, 10); // 10ms interval
   }

   function toggleSavePopup() { // shows / hides commit popup div
      savePopupCommitMsg.value = savePopupCommitMsg.value.trim(); // clears initial whitespace caused by <xsl: text>
      if (savePopup.classList.contains("visible")) {
         savePopup.classList.remove("visible");
         savePopupBG.classList.remove("visible");
      } else {
         savePopup.classList.add("visible");
         savePopupBG.classList.add("visible");
         savePopup.children[0].innerText = "Commit changes for: " + selectedVersions[(!dualMode || primaryCaret.src.includes("fill")) ? 0 : 1]; 
      }
   }

   function saveRegionChanges() { // saves tempSpeakerObjects to speakerObjects
      if (!saveButton.classList.contains("disabled")) {
         toggleSavePopup();
         // old save functionality
         // currSpeakerSet.speakerObjects = cloneSpeakerObjectArray(currSpeakerSet.tempSpeakerObjects);
         // editsMade = false;
         // removeCurrentRegion();
         // reloadRegionsAndChapters();
         // console.log("saved changes.");
      }
   }

   /**
   * Commits changes made to the currently selected set to Greenstone's version history system. 
   * Firstly increments FLDV, then saves commit message to document's metadata, then sets document's
   * associated file to tempSpeakerObjects CSV.
   */
   function commitChanges() {
      ajaxSetUniqueSpeakerMeta();
      // return;
      if (savePopupCommitMsg.value && savePopupCommitMsg.value.length > 0) {
         console.log('committing with message: ' + savePopupCommitMsg.value);
         $.ajax({
            type: "GET",
            url: mod_meta_base_url,
            data: { "o": "json", "s1.a": "inc-fldv-nminus1" }
         }).then((out) => {
            if (out.page.pageResponse.status.code == GSSTATUS_SUCCESS) { 
               console.log('fldv inc success with status code: ' + out.page.pageResponse.status.code);
               ajaxSetCommitMeta();
            } else {
               console.log('fldv inc ERROR with status code: ' + out.page.pageResponse.status.code);
               // TODO output tangible error message from out.page.pageResponse [unsure of property, do same for all two(three?) calls]
            }
         }, (error) => { console.log("inc-fldv-nminus1 error:\n" + error) });
         toggleSavePopup();
      } else {
         window.alert("Commit message cannot be left empty.");
      }
   }

   function ajaxSetCommitMeta() { // saves commit message to current document's metadata
      $.ajax({
         type: "GET",
         url: mod_meta_base_url,
         data: { "o" : "json", "s1.a": "set-archives-metadata", "s1.metaname": "commitmessage", "s1.metavalue": savePopupCommitMsg.value.trim(), "s1.metamode": "override" },
      }).then((out) => {
         console.log('commit success with status code: ' + out.page.pageResponse.status.code);
         if (out.page.pageResponse.status.code == GSSTATUS_SUCCESS) {
            ajaxSetAssocFile();
         } // TODO else error message
      }, (error) => { console.log("commit_msg_url error:"); console.log(error); });
   }

   function ajaxSetAssocFile() { // sets current document's associated file to tempSpeakerObjects
      $.ajax({
         type: "POST",
         url: gs.xsltParams.library_name,
         data: { "o" : "json", "a": "g", "rt": "r", "ro": "0", "s": "ModifyMetadata", "s1.collection": gs.cgiParams.c, "s1.site": gs.xsltParams.site_name, "s1.d": gs.cgiParams.d, 
                  "s1.a": "set-archives-assocfile", "s1.assocname": "structured-audio.csv", "s1.filedata": speakerObjToCSVText() },
      }).then((out) => {
         if (out.page.pageResponse.status.code == GSSTATUS_SUCCESS) {
            console.log('set-archives-assocfile success with status code: ' + out.page.pageResponse.status.code);
            resetUndoStates();
            // ajaxSetUniqueSpeakerMeta();
         } else {
            console.error("set-archives-assocfile error with code: " + out.page.pageResponse.status.code);
         }
      }, (error) => { console.log("set_assoc_url error:"); console.log(error); });
   }

   function ajaxSetUniqueSpeakerMeta() {
      // get existing original SpeakerName values found in metadataTable
      // compare with new SpeakerName values in currSpeakerSet.uniqueSpeakers
      const metadataTable = document.getElementById("meta" + gs.documentMetadata.Identifier);
      let tableSpeakerNames = []; // SpeakerName metadata entry as found in metadata table
      $(".metaTableCellArea").each(function () {
         if (this.classList.contains("SpeakerName")) {
            tableSpeakerNames.push(this.value); 
         }
      });

      console.log(tableSpeakerNames) // old
      console.log(currSpeakerSet.uniqueSpeakers) // new

      for (const uniqueSpeaker of currSpeakerSet.uniqueSpeakers) {
         if (!tableSpeakerNames.includes(uniqueSpeaker)) {
            // TODO: add speaker
            let newMetaTextbox = metadataTable.parentElement.getElementsByTagName("input")[0];
            newMetaTextbox.value = "SpeakerName"; // set metadata title
            newMetaTextbox.nextElementSibling.click(); // click 'add new metadata'
            $(".metaTableCellArea, .SpeakerName").last().val(uniqueSpeaker); // fill in new textbox
         }
      }

      for (const oldUniqueSpeaker of tableSpeakerNames) {
         if (!currSpeakerSet.uniqueSpeakers.includes(oldUniqueSpeaker)) {
            console.log("Deleting speaker: " + oldUniqueSpeaker);
            $(".metaTableCellArea").each(function() {
               if (this.classList.contains("SpeakerName") && this.value === oldUniqueSpeaker) {
                  this.parentElement.nextElementSibling.firstChild.click(); // manually click remove button
               }
            });
         }
      }
      saveAndRebuild(true); 

      // $.ajax({
      //    type: "POST",
      //    url: gs.xsltParams.library_name,
      //    data: { "o" : "json", "a": "g", "rt": "r", "ro": "0", "s": "ModifyMetadata", "s1.collection": gs.cgiParams.c, "s1.site": gs.xsltParams.site_name, "s1.d": gs.cgiParams.d, 
      //             "s1.a": "set-metadata-array", "s1.where": "archives|index", "s1.json": 
      //                JSON.stringify([{"docid": gs.cgiParams.d, "metatable":[{"metaname":"SpeakerName", "metavals": currSpeakerSet.uniqueSpeakers}], "metamode":"override"}])
      //          },
      // }).then((out) => {
      //    console.log(out.page.pageResponse.status.content)
      //    if (out.page.pageResponse.status.code == GSSTATUS_SUCCESS) {
      //       console.log('set-metadata-array success with status code: ' + out.page.pageResponse.status.code);
      //       // buildCollections([gs.cgiParams.c], null, () => {
      //       //    console.log("yay rebuilt!");
      //       // });
            
      //    } 
      // }, (error) => { console.log("set-metadata-array error:"); console.log(error); });
   }

   function speakerObjToCSVText() { // converts tempSpeakerObjects to csv-like string 
      // SPEAKER, START, END, DURATION_LOCK, SPEAKER_LOCK, GLOBAL_LOCK
      const regex = new RegExp("SPEAKER_\\d{2}");
      return currSpeakerSet.tempSpeakerObjects.map(item => [item.speaker, item.start, item.end, item.locked || false, !regex.test(item.speaker), !regex.test(item.speaker) || item.locked]).join("\n");
   }

   function discardRegionChanges(forceDiscard) { // resets tempSpeakerObjects to speakerObjects
      if (!discardButton.classList.contains("disabled") || forceDiscard) {
         let confirm = false;
         if (!forceDiscard) { confirm = window.confirm("Are you sure you want to discard changes?"); }
         if (confirm || forceDiscard) {
            currSpeakerSet.tempSpeakerObjects = cloneSpeakerObjectArray(currSpeakerSet.speakerObjects);
            editsMade = false;
            removeCurrentRegion();
            resetUndoStates();
            reloadRegionsAndChapters();
            console.log("discarded changes");
         }
      }
   }

   /**
   * Redraws edit panel, chapter list and wavesurfer regions from speaker set
   */
   function reloadRegionsAndChapters() { // redraws edit panel, chapter list, wavesurfer regions 
      updateRegionEditPanel();
      $(".region-top").remove();
      $(".region-bottom").remove();
      $(".wavesurfer-region").remove();
      populateChaptersAndRegions(primarySet);
      if (dualMode) { 
         populateChaptersAndRegions(secondarySet);
         currSpeakerSet = primarySet;
      }
      updateCurrSpeakerSet();
      if (editMode && currentRegion && currentRegion.speaker && getCurrentRegionIndex() != -1 && currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element) { 
         setHoverSpeaker(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left, currentRegion.speaker);
         drawCurrentRegionBounds();
      }
      if (currentRegions.length < 1) { 
         removeButton.innerHTML = "Remove Selected Region";
         // enableStartEndInputs();
      } else {
         removeButton.innerHTML = "Remove Selected Regions (x" + currentRegions.length + ")";
         const uniqueSelectedSpeakers = [... new Set(currentRegions.map(a => a.speaker))]; // gets unique speakers in currentRegions
         uniqueSelectedSpeakers.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
         speakerInput.value = uniqueSelectedSpeakers.join(", ");
      }
      let autocompleteOptions = currSpeakerSet.uniqueSpeakers;
      autocompleteOptions.pop();
      autocompleteOptions.sort();
      $("#speaker-input").autocomplete({
         source: autocompleteOptions,
         minLength: 2,
         close: (event, ui) => {
            // updates speaker name on autocomplete dropdown close
            speakerChange();
         }
      });
   }

   /**
   * Handles the change of a region's start or end time, updating hte speaker set
   */
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
         editLockedRegion(currSpeakerSet.tempSpeakerObjects[currRegIdx]);
      } else { 
         console.log("no region selected");
         setInputInSeconds(startTimeInput, 0);
         setInputInSeconds(endTimeInput, 0);
      }
   }

   /**
   * Calculates time in seconds of start or end time input group
   * @param {element} input Element of time input groups: hh:mm:ss
   * @returns {int} Time in seconds 
   */
   function getTimeInSecondsFromInput(input) { 
      let hours = input.children[0].valueAsNumber;
      let mins = input.children[1].valueAsNumber;
      let secs = input.children[2].valueAsNumber;
      return (hours * 3600) + (mins * 60) + secs;
   }

   /**
   * Sets the start or end time element group inputs 
   * @param {element} input Element of time input group to be updated
   * @param {int} seconds Duration in seconds to be converted into hh:mm:ss
   */
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
      });      
   }

   /**
    * Adds a new undo state to the global undo state list
    * @param {object} state Primary set at current state
    * @param {object} secState Secondary set at current state
    * @param {boolean} isSec Whether or not current change was made to primary (false) or secondary (true) set
    * @param {boolean} dualMode Whether or not audio editor was in dual mode when undo state was added
    * @param {string} type Type of change e.g "remove", "speaker-change"
    * @param {int} currRegIdx Index of currently selected region (for restoration)
    * @param {Array} currRegIdxs Index of currently selected regions, if applicable (for restoration)
    */
   function addUndoState(state, secState, isSec, dualMode, type, currRegIdx, currRegIdxs) { // adds a new state to the undoStates stack
      let newState = cloneSpeakerObjectArray(state.tempSpeakerObjects); // clone method removes references
      let newSecState = cloneSpeakerObjectArray(secState.tempSpeakerObjects); // clone method removes references
      let changedTrack = (type == "dualModeChange" || type == "selectAllChange") ? "none" : selectedVersions[isSec ? 1 : 0] // sets changedTrack to version name of edited region set 
      undoButton.classList.remove("disabled");
      undoStates = undoStates.slice(0, undoLevel + 1); // trim to current level if undos have already been made
      undoStates.push({state: newState, secState: newSecState, isSec: isSec, changedTrack: changedTrack, dualMode: dualMode, currentRegionIndex: currRegIdx, currentRegionIndexes: currRegIdxs, type: type});
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
      localStorage.setItem(audioIdentifier, JSON.stringify({ "undoStates": undoStates, "undoLevel": undoLevel }));
   }

   /**
    * Returns to the previous state in the undo state list
    */
   function undo() {
      if (!undoButton.classList.contains("disabled") && editMode) { // ensure there exist states to undo to
         setChapterSearch("");
         if (undoLevel - 1 < 0) console.log("ran out of undos");
         else {            
            removeCurrentRegion();  
            let adjustedUndoLevel = undoLevel-1;
            if (undoStates[undoLevel].type == "dualModeChange") { // toggle dual mode
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
               if (undoStates[undoLevel] && undoStates[undoLevel].type && undoStates[undoLevel].type == "remove") { // if destination state type is remove
                  selectedSpeakerSet = (undoStates[undoLevel].isSec) ? secondarySet : primarySet;
                  if (selectedSpeakerSet.isSecondary) caretClicked("secondary-caret");
                  else caretClicked("primary-caret");
                  currentRegion = selectedSpeakerSet.tempSpeakerObjects[undoStates[undoLevel].currentRegionIndex]; // restore previous current state
               } else if (undoStates[undoLevel].currentRegionIndex) {
                  if (!dualMode) selectedSpeakerSet = primarySet;
                  else {
                     selectedSpeakerSet = (undoStates[undoLevel-1].isSec) ? secondarySet : primarySet;
                     if (selectedSpeakerSet.isSecondary) caretClicked("secondary-caret");
                     else caretClicked("primary-caret");
                  }
                  currentRegion = selectedSpeakerSet.tempSpeakerObjects[undoStates[undoLevel].currentRegionIndex];
               } 
               // handle currentRegions restoration
               if (undoStates[undoLevel].currentRegionIndexes && undoStates[undoLevel].currentRegionIndexes.length > 1) {
                  for (const idx of undoStates[undoLevel].currentRegionIndexes) currentRegions.push(currSpeakerSet.tempSpeakerObjects[idx]);
               }
            }
            editsMade = true;
            undoLevel--; // decrement undoLevel
            reloadRegionsAndChapters();
            localStorage.setItem(audioIdentifier, { "undoLevel": undoLevel });
            if (undoLevel - 1 < 0) undoButton.classList.add("disabled");
            else undoButton.classList.remove("disabled");
         }
         if (undoLevel < undoStates.length) redoButton.classList.remove("disabled");
         updateUniqueSpeakers();
      }
   }

   /**
    * Moves forward one state in the undo state list
    */
   function redo() {
      if (!redoButton.classList.contains("disabled") && editMode) { // ensure there exist states to redo to
         setChapterSearch("");
         if (undoLevel + 1 >= undoStates.length) console.log("ran out of redos");
         else {
            if (undoStates[undoLevel+1].type == "dualModeChange") { // toggle dual mode
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
                  if (undoStates[undoLevel+1].currentRegionIndexes && undoStates[undoLevel+1].currentRegionIndexes.length > 1) {
                     for (const idx of undoStates[undoLevel+1].currentRegionIndexes) currentRegions.push(currSpeakerSet.tempSpeakerObjects[idx]);
                  }
               }
            }
            editsMade = true;  
            reloadRegionsAndChapters();
            undoLevel++; // increment undoLevel
            localStorage.setItem(audioIdentifier, { "undoLevel": undoLevel });
            if (undoLevel + 1 > undoStates.length - 1) redoButton.classList.add("disabled");
            else redoButton.classList.remove("disabled");
         }
         if (undoLevel < undoStates.length) undoButton.classList.remove("disabled");
         updateUniqueSpeakers();
      }
   }

   function resetUndoStates() { // clear undo history
      undoStates = [{state: cloneSpeakerObjectArray(primarySet.tempSpeakerObjects), secState: cloneSpeakerObjectArray(secondarySet.tempSpeakerObjects)}];
      undoLevel = 0;
      localStorage.removeItem(audioIdentifier);
      undoButton.classList.add("disabled");
      redoButton.classList.add("disabled");
   }

   function waveformScrolled() { // waveform scroll handler
      if (currentRegion.speaker && getCurrentRegionIndex() != -1) { // updates region bound markers if selected region exists
         setHoverSpeaker(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region.element.style.left, currentRegion.speaker);
         drawCurrentRegionBounds();
      }
      if (document.getElementById('new-canvas')) { document.getElementById('new-canvas').style.left = "-" + wave.scrollLeft + 'px' } // update placeholder waveform scroll position
   }

   function drawCurrentRegionBounds() { // draws bounds of current region
      removeRegionBounds();
      let currIndexes = getCurrentRegionsIndexes();
      if (getCurrentRegionIndex() != -1) drawRegionBounds(currSpeakerSet.tempSpeakerObjects[getCurrentRegionIndex()].region, wave.scrollLeft, "FireBrick");
      for (let i = 0; i < currIndexes.length; i++) {
         drawRegionBounds(currSpeakerSet.tempSpeakerObjects[currIndexes[i]].region, wave.scrollLeft, "FireBrick");
      }
   }

   /**
    * Draws bounding 'n' above hovered or selected region 
    * @param {object} region Region to have bound drawn for
    * @param {number} scrollPos Scroll position of div, used to offset draw position
    * @param {string} colour Colour to draw bound (black and FireBrick are used)
    */
   function drawRegionBounds(region, scrollPos, colour) { // draws on canvas to show bounds of hovered/selected region
      const hoverSpeakerCanvas = document.createElement("canvas");
      hoverSpeakerCanvas.id = "hover-speaker-canvas";
      hoverSpeakerCanvas.classList.add("region-bounds");
      hoverSpeakerCanvas.width = audioContainer.clientWidth; // max width of drawn bounds
      const ctx = hoverSpeakerCanvas.getContext("2d");
      // ctx.translate(0.5, 0.5); // fixes lineWidth inconsistency
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

   function updateCurrSpeakerSet() { // updates 'currSpeakerSet' var
      if (primaryCaret.src.includes("fill")) currSpeakerSet = primarySet;
      else if (secondaryCaret.src.includes("fill")) currSpeakerSet = secondarySet;
   }

   function cloneSpeakerObjectArray(inputArray) { // clones speakerObjectArray without references (wavesurfer regions)
      let output = [];
      for (let i = 0; i < inputArray.length; i++) { 
         output.push({ speaker: inputArray[i].speaker, start: inputArray[i].start, end: inputArray[i].end, locked: (inputArray[i].locked === "true" || inputArray[i].locked === true) });
      }
      return output;
   }

   function flashChapters() { // flashes chapters a lighter colour momentarily to indicate an update/change
      chapters.style.backgroundColor = "rgb(66, 84, 88)";
      setTimeout(() => chapters.style.backgroundColor = backgroundColour, 500);
   }

   /** Fullscreen onChange handler, increases waveform height & adjusts padding/margin */
   function fullscreenChanged() { 
      if (!audioContainer.classList.contains("fullscreen")) {
         audioContainer.classList.add("fullscreen");
         wavesurfer.setHeight(fullscreenWaveformHeight); // increase waveform height
         caretContainer.style.paddingLeft = "2rem"; 
         caretContainer.style.height = wavesurfer.getHeight() + "px"; // set height to waveform height
         audioContainer.prepend(caretContainer); // attach to audioContainer (otherwise doesn't show due to AC being fullscreen)
      } else  {
         audioContainer.classList.remove("fullscreen");
         wavesurfer.setHeight(waveformHeight);
         caretContainer.style.paddingLeft = "0";
         caretContainer.style.height = wavesurfer.getHeight() + "px";
         audioContainer.parentElement.prepend(caretContainer); // move back up in DOM hierarchy 
      }
      setTimeout(() => { // ensures waveform shows  
         zoomOutButton.click();
         zoomInButton.click();
      }, 250);
   }

   /** Enables / disables the fullscreen view of audio player / editor */
   function toggleFullscreen() { 
      if ((document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null)) {
         document.exitFullscreen();
      } else {
         if (audioContainer.requestFullscreen) {
            audioContainer.requestFullscreen();
         } else if (audioContainer.webkitRequestFullscreen) { /* Safari */
            audioContainer.webkitRequestFullscreen();
         } else if (audioContainer.msRequestFullscreen) { /* IE11 */
            audioContainer.msRequestFullscreen();
         }
      }
   }
}

/**
 * Formats seconds to hh:mm:ss
 * @param {number} duration 
 * @returns {string} Time in hh:mm:ss format
 */
function formatAudioDuration(duration) {
   // console.log('duration: ' + duration);
   let [hrs, mins, secs, ms] = duration.replace(".", ":").split(":");
   return hrs + ":" + mins + ":" + secs;
}
