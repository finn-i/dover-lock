<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:java="http://xml.apache.org/xslt/java" xmlns:util="xalan://org.greenstone.gsdl3.util.XSLTUtil"
	xmlns:gslib="http://www.greenstone.org/skinning"
	xmlns:gsf="http://www.greenstone.org/greenstone3/schema/ConfigFormat" extension-element-prefixes="java util"
	exclude-result-prefixes="java util gsf">

	<!-- the page content -->
	<xsl:template match="/page/pageResponse/document">
	  <xsl:if test="$bookswitch = 'off'">
	  <xsl:call-template name="javascriptForDocumentView"/>
	  <gslib:langfrag name="doc"/>
	    <xsl:if test="/page/pageResponse/collection[@name = $collName]/metadataList/metadata[@name = 'tidyoption'] = 'tidy'">
	      <script type="text/javascript">
		<xsl:text disable-output-escaping="yes">
		  if(document.URL.indexOf("book=on") != -1)
		  {
		  loadBook();
		  }
		</xsl:text>
	      </script>
	    </xsl:if>
	  </xsl:if>
	  <xsl:if test="$canDoEditing = 'true'">
	    <xsl:call-template name="javascriptForDocumentEditing"/>
	    <gslib:langfrag name="dse"/>
	    <gslib:langfrag name="de"/>
	  </xsl:if>

		<xsl:if test="$bookswitch = 'off'">
			<div id="bookdiv" style="visibility:hidden; height:0px; display:inline;"><xsl:text> </xsl:text></div>
		
			<div id="float-anchor" style="width: 30%; min-width:180px; float:right; margin: 0 0 10px 20px;">		
	                <xsl:if test="$canDoEditing = 'true'">
				<xsl:call-template name="editBar"/>
			</xsl:if>
			<xsl:if test="not(/page/pageResponse/format[@type='display']/gsf:option[@name='sideBar']) or /page/pageResponse/format[@type='display']/gsf:option[@name='sideBar']/@value='true'">
				<xsl:call-template name="rightSidebarTOC"/>
			</xsl:if>
			<!-- add in some text just in case nothing has been added to this div-->
			<xsl:text> </xsl:text>
			</div>
	                <xsl:if test="$canDoEditing = 'true'">
			  <script type="text/javascript"> 
			  if (keep_editing_controls_visible) {
			  $(function() {
			  moveScroller();
			  });
			  }
			</script> 	
			</xsl:if>
		</xsl:if>
		
		<!-- display the document -->
		<xsl:choose>
			<xsl:when test="@external != ''">
				<xsl:call-template name="externalPage">
					<xsl:with-param name="external" select="@external"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$bookswitch = 'flashxml'">
				<xsl:call-template name="documentNodeFlashXML"/>
			</xsl:when>
			<xsl:when test="$bookswitch = 'on'">
				<div id="bookdiv" style="display:inline;"><xsl:text> </xsl:text></div>
				<!-- *** in document-scripts.js *** -->
				<script type="text/javascript">
					<xsl:text disable-output-escaping="yes">
						if(document.URL.indexOf("book=on") != -1)
						{
							loadBook();
						}
					</xsl:text>
				</script>
			</xsl:when>
			<!-- we want to do this stuff even if docType is simple or paged. Don't want to just set dt=hierarchy as that gives other unnecessary stuff-->
			<!-- This is the first choice from wrappedDocument template-->
			<xsl:when test="$canDoEditing = 'true' and $editingTurnedOn = 'true' ">
				<div id="gs-document" style="width: 100%">
				  <xsl:call-template name="documentPre"/>
				  <div id="gs-document-text" class="documenttext" collection="{/page/pageResponse/collection/@name}"><!-- *** -->
				    <xsl:choose>
				      <xsl:when test="@docType='simple'">
								<xsl:call-template name="wrapDocumentNodes"/>
								<xsl:call-template name="documentHeading"/><br/>
								<xsl:call-template name="documentContent"/>
				      </xsl:when>
				      <xsl:otherwise>
				    <xsl:for-each select="documentNode">
				      <xsl:call-template name="wrapDocumentNodes"/>
				    </xsl:for-each>
				      </xsl:otherwise>
				    </xsl:choose>
				  </div>
				  <xsl:call-template name="documentPost"/>				  
				</div>
			</xsl:when>
			<xsl:when test="@docType='simple'">
				<xsl:call-template name="documentHeading"/><br/>
				<xsl:call-template name="documentContent"/>
				<br /><xsl:call-template name="userCommentsSection"/>
			</xsl:when>	
			<xsl:otherwise> <!-- display the standard greenstone document -->
				<xsl:call-template name="wrappedDocument"/>
				<br /><xsl:call-template name="userCommentsSection"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="sectionContent">
		<xsl:call-template name="wrappedSectionImage"/>
		<xsl:call-template name="wrappedSectionText"/>
	</xsl:template>
	<xsl:template name="sectionContentForEditing">
		<!-- <xsl:call-template name="wrappedSectionImage"/>
		<xsl:call-template name="wrappedSectionTextForEditing"/> -->
	</xsl:template>

	<xsl:template name="documentNodeAudio">
		<gsf:variable name="allowEditing">
			<xsl:choose>
				<xsl:when test="$canDoEditing = 'true' and $editingTurnedOn = 'true' ">
					<xsl:text>1</xsl:text>
				</xsl:when>
				<xsl:otherwise>0</xsl:otherwise>
			</xsl:choose>
		</gsf:variable>

		<gsf:variable name="metadataServerURL">
			<xsl:value-of select="$metadata-server-url"/>
		</gsf:variable>

		<!-- userEditMode = <xsl:value-of select="$userHasEditPermission"/> -->

		<!-- <xsl:variable name ="get-archives-assocfile"><xsl:value-of select="$metadata-server-url"/><xsl:text disable-output-escaping="yes">?a=get-archives-assocfile&amp;</xsl:text></xsl:variable> -->
		<!-- <xsl:variable name="site-col-doc">site=<xsl:value-of select="$site_name"/><xsl:text disable-output-escaping="yes">&amp;c=</xsl:text><xsl:value-of select="$collName"/><xsl:text disable-output-escaping="yes">&amp;d=</xsl:text><xsl:value-of select="$docID"/></xsl:variable> -->

		<script type="text/javascript">
			<xsl:text disable-output-escaping="yes">
				$(document).ready(function() {
					if (gs.variables.allowEditing) {
						loadAudio(gs.variables.metadataServerURL+'?a=get-archives-assocfile&amp;site='+gs.xsltParams.site_name+'&amp;c='+gs.cgiParams.c+'&amp;d='+gs.cgiParams.d+'&amp;assocname='+gs.documentMetadata.Audio,
											gs.variables.metadataServerURL+'?a=get-archives-assocfile&amp;site='+gs.xsltParams.site_name+'&amp;c='+gs.cgiParams.c+'&amp;d='+gs.cgiParams.d+'&amp;assocname=structured-audio.csv');
					} else {
						loadAudio('</xsl:text><xsl:value-of select="$httpPath"/><xsl:text disable-output-escaping="yes">/index/assoc/' + gs.documentMetadata.assocfilepath + '/' + gs.documentMetadata.Audio,
						'</xsl:text><xsl:value-of select="$httpPath"/>/index/assoc/' + gs.documentMetadata.assocfilepath + '/structured-audio.csv<xsl:text disable-output-escaping="yes">');
					}
				})
			</xsl:text>
		</script>

		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"><xsl:text> </xsl:text></script>
		<script type="text/javascript" src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"><xsl:text> </xsl:text></script>
		<script type="text/javascript" src="https://unpkg.com/wavesurfer.js@6.6.0/dist/wavesurfer.js"><xsl:text> </xsl:text></script>
		<script type="text/javascript" src="https://unpkg.com/wavesurfer.js@6.6.0/dist/plugin/wavesurfer.regions.min.js"><xsl:text> </xsl:text></script>
		<script type="text/javascript" src="https://unpkg.com/wavesurfer.js@6.6.0/dist/plugin/wavesurfer.timeline.min.js"><xsl:text> </xsl:text></script>
		<script type="text/javascript" src="https://unpkg.com/wavesurfer.js@6.6.0/dist/plugin/wavesurfer.cursor.min.js"><xsl:text> </xsl:text></script>
		<script type="text/javascript" src="https://d3js.org/colorbrewer.v1.min.js"><xsl:text> </xsl:text></script>
				<div id="save-popup-bg"><xsl:text> </xsl:text></div>
				<div id="save-popup">
					<span>Commit changes:</span> 
					<textarea id="commit-message" placeholder="Commit message" rows="2"><xsl:text> </xsl:text></textarea>
					<div class="flex-centeralign">
						<button class="ui-button" id="save-popup-cancel">Cancel</button>
						<button class="ui-button" id="save-popup-commit">Commit</button>
					</div>
				</div>
				<div id="caret-container">
					<img src="interfaces/{$interface_name}/images/bootstrap/caret-right-fill.svg" id="primary-caret" />
					<img src="interfaces/{$interface_name}/images/bootstrap/caret-right.svg" id="secondary-caret" />
				</div>
        <div id="audioContainer" tabindex="0">
						<div id="context-menu">
							<div class="context-menu-item" id="context-menu-replace">Replace Selected Down</div>
							<div class="context-menu-item" id="context-menu-overdub">Overdub Selected Down</div>
							<div class="context-menu-item" id="context-menu-lock">Lock Selected</div>
							<div class="context-menu-item" id="context-menu-delete">Delete Selected</div>
						</div>
						<div id="timeline-menu">
							<div class="timeline-menu-item" id="timeline-menu-hide">Hide Regions <input type="checkbox" /></div>
							<div class="timeline-menu-item" id="timeline-menu-dualmode">Dual Mode <input type="checkbox" id="dual-mode-checkbox" /></div>
							<hr></hr>
							<div class="timeline-menu-subtext">Show Differences</div>
							<div class="timeline-menu-item disabled" id="timeline-menu-region">Region:Start/Stop <input type="checkbox" /></div>
							<div class="timeline-menu-item disabled" id="timeline-menu-speaker">Speaker Label <input type="checkbox" /></div>
						</div>
            <div id="hover-speaker"><xsl:text> </xsl:text></div>
						<div id="version-select-menu"><xsl:text> </xsl:text></div>
            <div id="waveform">
							<div id="waveform-blocker"><div id="waveform-spinner"><xsl:text> </xsl:text></div></div>
							<span id="waveform-loader">Loading audio</span>
							<div class="track-set-label" id="track-set-label-top">
								<span>Current</span>
								<img class="track-arrow" src="interfaces/{$interface_name}/images/bootstrap/caret-right.svg"/>
							</div>
							<div class="track-set-label" id="track-set-label-bottom">
								<span>nminus-1</span>
								<img class="track-arrow" src="interfaces/{$interface_name}/images/bootstrap/caret-right.svg"/>
							</div>
							<img src="interfaces/{$interface_name}/images/bootstrap/gear.svg" id="timeline-menu-button" />
						</div>
            <div id="wave-timeline"><xsl:text> </xsl:text></div>
            <div id="audio-toolbar">
							<div class="flex-leftalign toolbar-section">
								<img src="interfaces/{$interface_name}/images/bootstrap/chapters.svg" id="chapterButton" title="Click to expand audio chapters" />
								<img src="interfaces/{$interface_name}/images/bootstrap/zoom-out.svg" id="zoomOutButton" title="Click to zoom out" />
								<input type="range" min="0" max="200" value="50" id="zoom-slider" step="10" title="Click and drag to adjust zoom level" />
								<img src="interfaces/{$interface_name}/images/bootstrap/zoom-in.svg" id="zoomInButton" title="Click to zoom in" />
							</div>
							<div class="flex-centeralign toolbar-section">
								<img src="interfaces/{$interface_name}/images/bootstrap/back.svg" id="backButton" title="Click to skip back" />
								<img src="interfaces/{$interface_name}/images/bootstrap/play.svg" id="playPauseButton" title="Click to toggle play/pause" />
								<img src="interfaces/{$interface_name}/images/bootstrap/forward.svg" id="forwardButton" title="Click to skip forwards" />
							</div>
							<div class="flex-rightalign toolbar-section">
								<img src="interfaces/{$interface_name}/images/bootstrap/edit.svg" id="editorModeButton" title="Click to toggle region edit panel" />
								<img src="interfaces/{$interface_name}/images/bootstrap/download.svg" id="downloadButton" title="Click to download audio" />
								<div id="volume-container">
									<img src="interfaces/{$interface_name}/images/bootstrap/unmute.svg" id="muteButton" title="Click to toggle mute" />
									<input type="range" min="0" max="1" value="1" id="volume-slider" step="0.1" orient="vertical" title="Click and drag to adjust volume level" />
								</div>
								<img src="interfaces/{$interface_name}/images/bootstrap/fullscreen.svg" id="fullscreenButton" title="Click to toggle fullscreen mode" />
							</div>
            </div>
						<div id="audio-dropdowns">
							<div id="chapters-container">
								<div id="chapter-search-box">
									<img src="interfaces/{$interface_name}/images/bootstrap/funnel.svg" />
								 	<input type="text" placeholder="Search.." id="chapter-search-input" maxlength="40" />
								</div>
								<div id="chapters"><text></text></div>
							</div>
							<div id="edit-panel">
								<button class="ui-button" id="create-button" title="Create a new region">Create New Region</button>
								<div class="flex-row" id="save-discard">
									<button class="ui-button" id="discard-button" title="Discard changes made to regions">Discard Changes</button>
									<img class="disabled" src="interfaces/{$interface_name}/images/bootstrap/undo.svg" id="undo-button" title="Undo changes made to regions" />
									<img class="disabled" src="interfaces/{$interface_name}/images/bootstrap/redo.svg" id="redo-button" title="Redo changes made to regions" />
									<button class="ui-button" id="save-button" title="Save changes made to regions">Save Changes</button>
								</div>
								<div>
									<div class="flex-row selected-header">
										<h3>Selected Region:</h3>
									</div>
									<div class="flex-row selected-header" >
										Speaker:&#160;&#160;&#160;&#160;
										<input type="text" id="speaker-input" required="true" maxlength="40" />
										<div>
											<input type="checkbox" id="change-all-checkbox" value="all" name="change-speaker" title="Enable to select all speakers with the same name" />
											<label id="change-all-label" for="change-all-checkbox">Select all</label>
										</div>
									</div>
									<div id="region-details">
										Start time:
										<div class="time-picker" id="start-time-input">
											<input type="number" min="0" max="10" value="00" class="no-arrows hours" />:
											<input type="number" min="-1" max="60" value="00" class="no-arrows minutes" />:
											<input type="number" min="-1" max="60" step="0.1" value="00" class="seconds" />
										</div><br/>
										End time:&#160;&#160;
										<div class="time-picker" id="end-time-input">
											<input type="number" min="0" max="10" value="00" class="no-arrows hours" />:
											<input type="number" min="-1" max="60" value="00" class="no-arrows minutes" />:
											<input type="number" min="-1" max="60" step="0.1" value="00" class="seconds" />
										</div>
									</div>
									&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;
									<div class="time-label-container">
											<input class="time-label" type="text" value="hh" readonly="true" disabled="true" />&#160;
											<input class="time-label" type="text" value="mm" readonly="true" disabled="true" />&#160;
											<input class="time-label" type="text" value="ss" readonly="true" disabled="true" />
										</div>
								</div>
								<button class="ui-button" id="remove-button" title="Remove the selected region">Remove Selected Region</button>
							</div>
						</div>
        </div>		
	</xsl:template>

	<xsl:template name="documentNodeText">
	  <xsl:param name="force">0</xsl:param>
		<!-- Hides the "This document has no text." message -->
		<xsl:variable name="noText"><gsf:metadata name="NoText"/></xsl:variable>
		<xsl:choose>
		<xsl:when test="$force = '1' or not($noText = '1')">

			<!-- Section text -->
			<xsl:for-each select="nodeContent">
			  <xsl:call-template name="displayMarkedUpTextAndAnnotations"/>
			</xsl:for-each>
		</xsl:when>
		<xsl:when test="$noText = '1' and not(metadataList/metadata[@name='ImageType'])">
			<xsl:call-template name="documentNodeAudio"/>
		</xsl:when>
		</xsl:choose>
		<xsl:text> </xsl:text>
	</xsl:template>

	<xsl:template name="documentHeading">
		<span style="font-weight:bold; font-size: 120%;">
			<xsl:call-template name="choose-title" />
		</span>
		<table id="tapeDetails">
			<gsf:switch>
				<gsf:metadata name='Notes' />
				<gsf:when test='exists'>
					<tr><td id="fCol">Notes:</td><td><gsf:metadata name="Notes" highlight="highlight" /></td></tr>
				</gsf:when>
			</gsf:switch>
			<gsf:switch>
				<gsf:metadata name='TapeLabel' />
				<gsf:when test='exists'>
					<tr><td id="fCol">Tape Label:</td><td><gsf:metadata name="TapeLabel" highlight="highlight" /></td></tr>
				</gsf:when>
			</gsf:switch>
			<gsf:switch>
				<gsf:metadata name='CardNotes' />
				<gsf:when test='exists'>
					<tr><td id="fCol">Card Notes:</td><td><gsf:metadata name="CardNotes" highlight="highlight" /></td></tr>
				</gsf:when>
			</gsf:switch>
			<gsf:switch>
				<gsf:metadata name='IsMicroCassette' />
				<gsf:when test='equals' test-value='y'>
					<tr><td id="fCol">Microcassette?</td><td>Yes</td></tr>
				</gsf:when>
			</gsf:switch>
			<gsf:switch>
				<gsf:metadata name='AudioDuration' />
				<gsf:when test='exists'>
					<tr><td>Audio Duration:</td><td id="audio-duration">
						<script type="text/javascript">
							<xsl:text disable-output-escaping="yes">
								$(document).ready(function() {
									var audio_duration = formatAudioDuration('</xsl:text><gsf:metadata name="AudioDuration" /><xsl:text disable-output-escaping="yes">');
									$('#audio-duration').html(audio_duration);
								})
							</xsl:text>
						</script>
					</td></tr>
				</gsf:when>
			</gsf:switch>
		</table>

		<gsf:variable name="audioSource"><gsf:metadata name="Source"/></gsf:variable>
		<!-- <audio controls src="Coronation_A.wav" type="audio/wav">
			Your browser does not support the audio element.
		</audio> -->

	</xsl:template>

</xsl:stylesheet>