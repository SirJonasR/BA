/**
 * Radar Tooltip System
 */

import * as d3 from "d3";
import { loadMarkedLibrary, getCSSColor } from './radar-visualization-utils.js';
import { RADAR_ANIMATION_CONFIG, AnimationUtils } from './radar-animations.js';

// Layout constants
const MARGIN_LEFT_RIGHT = 25;
const MARGIN_TOP = 22;
const MARGIN_BOTTOM = 10;
const MAX_WIDTH = 450;
const LINE_HEIGHT = 20;
const MARGIN_SCORE_TO_ICON = 5;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_TITLE_LENGTH = 40;
const LIKE_DISLIKE_ICON_SRC = "assets/thumbs_up_down.svg";

/**
 * Create tooltip system for radar visualization
 */
export function createTooltipSystem(radar, config) {
  loadMarkedLibrary();

  const bubble = radar
    .append("g")
    .attr("id", "bubble")
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");

  const rect = bubble
    .append("rect")
    .attr("rx", 12)
    .attr("ry", 12)
    .style("stroke-width", 1);
    // Colors applied dynamically in show functions

  const title = bubble
    .append("text")
    .attr("id", "title-text")
    .attr("x", MARGIN_LEFT_RIGHT)
    .attr("y", `${MARGIN_TOP}px`)
    .style("font-size", "18px")
    .style("font-weight", "600")
    .style("font-family", "Montserrat, sans-serif");
    // Color applied dynamically in show functions

  const description = bubble
    .append("text")
    .attr("id", "description-text")
    .style("font-size", "15px")
    .style("font-family", "Montserrat, sans-serif")
    .style("line-height", "1.4");
    // Color applied dynamically in show functions

  const scoreBackground = bubble
    .append("rect")
    .attr("id", "score-background")
    .attr("rx", 15)
    .attr("ry", 15)
    .attr("height", 35);
    // Color applied dynamically in show functions

  const score = bubble
    .append("text")
    .attr("id", "score-text")
    .attr("x", MARGIN_LEFT_RIGHT)
    .attr("y", `${MARGIN_TOP}px`)
    .style("font-size", "17px")
    .style("text-anchor", "end")
    .style("font-weight", 500);
    // Color applied dynamically in show functions

  const likeDislikeIcon = bubble
    .append("image")
    .attr("id", "likedislike-icon")
    .attr("width", 21)
    .attr("height", 21)
    .attr("href", LIKE_DISLIKE_ICON_SRC)
    .attr("x", MARGIN_LEFT_RIGHT)
    .attr("y", `${MARGIN_TOP}px`);

  return {
    bubble,
    showBubble: (d) => showBubble(d, bubble, title, description, rect, score, scoreBackground, likeDislikeIcon),
    hideBubble: () => hideBubble(bubble),
    showLifecycleDescription: (name, desc, ringY, ringX) => 
      showLifecycleDescription(name, desc, ringY, ringX, bubble, title, description, rect, likeDislikeIcon, score, scoreBackground)
  };
}

/**
 * Show technology tooltip bubble
 */
function showBubble(d, bubble, title, description, rect, score, scoreBackground, likeDislikeIcon) {
  if (!d.active) return;

  // Read current theme colors dynamically
  const colors = {
    surface: getCSSColor('--app-surface', '#ffffff'),
    borderLight: getCSSColor('--app-border-light', '#e0e6ed'),
    textPrimary: getCSSColor('--app-text-primary', '#1f2937'),
    textSecondary: getCSSColor('--app-text-secondary', '#374151'),
    backgroundSecondary: getCSSColor('--app-background-secondary', '#e5e7eb')
  };

  // Move tooltip to end of DOM for proper z-index
  const parent = bubble.node().parentNode;
  parent.appendChild(bubble.node());

  // Make bubble interactive but initially invisible
  bubble
    .style("pointer-events", "all")
    .style("opacity", 0);

  // Apply current theme colors to tooltip elements
  rect
    .style("fill", colors.surface)
    .style("stroke", colors.borderLight);

  title.style("fill", colors.textPrimary);
  description.style("fill", colors.textSecondary);
  score.style("fill", colors.textPrimary);
  scoreBackground.style("fill", colors.backgroundSecondary);

  const bottom = d.quadrant === 2 || d.quadrant === 3;
  const right = d.quadrant === 0 || d.quadrant === 3;
  
  let marginBottom = MARGIN_BOTTOM;
  let descriptionMarginTop = 15 + MARGIN_TOP;
  const setTitleText = (titleName) => {
    if (titleName.length > MAX_TITLE_LENGTH) {
      const text1 = titleName.slice(0, MAX_TITLE_LENGTH);
      let text2 = titleName.slice(MAX_TITLE_LENGTH);
      
      if (text2.length > MAX_TITLE_LENGTH) {
        text2 = text2.slice(0, MAX_TITLE_LENGTH) + "...";
      }
      
      const tspan1 = title
        .text(null)
        .append("tspan")
        .attr("x", title.attr("x"))
        .text(text1.trim());
      
      const tspan2 = title
        .append("tspan")
        .attr("x", title.attr("x"))
        .attr("dy", LINE_HEIGHT)
        .text(text2.trim());
      
      marginBottom -= 20;
    } else {
      title.text(titleName);
    }
  };

  const getTitleSpecs = () => title.node().getBBox();
  
  const calculateDescriptionPosition = (titleSpecs) => {
    descriptionMarginTop += titleSpecs.height;
  };

  const calculateTotalScoreWidth = () => {
    return (
      likeDislikeIcon.node().getBBox().width +
      score.node().getComputedTextLength() +
      MARGIN_SCORE_TO_ICON +
      MARGIN_LEFT_RIGHT
    );
  };

  const chooseAndTransformDescriptionText = () => {
    // Prioritize shortDescription (kurzbeschreibung) over description (beschreibung)
    let descriptionText = d.shortDescription || d.technologyShortDescription || '';
    
    // Fallback to first 300 characters from description if shortDescription is not available
    if (!descriptionText.trim() && (d.description || d.technologyDescription)) {
      const fullDescription = d.description || d.technologyDescription || '';
      descriptionText = fullDescription.substring(0, MAX_DESCRIPTION_LENGTH);
    }
    
    if (descriptionText.trim()) {
      const renderedHTML = renderMarkdownToHTML(descriptionText);
      const truncatedDescription = truncateText(
        description.html(renderedHTML).text(),
        MAX_DESCRIPTION_LENGTH,
      );
      description.text(truncatedDescription);
    } else {
      description.text('No description available');
    }
  };

  const splitDescriptionIntoLines = () => {
    chooseAndTransformDescriptionText();
    const words = description.text().split(/\s+/);
    let tspan = description
      .text(null)
      .append("tspan")
      .attr("x", description.attr("x"));

    words.forEach((word, index) => {
      const textNode = tspan.text();
      const newText = textNode + word + (index === words.length - 1 ? "" : " ");
      tspan.text(newText);
      
      if (tspan.node().getComputedTextLength() > MAX_WIDTH) {
        tspan.text(textNode.trim());
        tspan = description
          .append("tspan")
          .attr("x", title.attr("x"))
          .attr("dy", LINE_HEIGHT)
          .text(word + (index === words.length - 1 ? "" : " "));
      }
    });
  };

  const calculateRectHeight = (descriptionBBox, titleBBox) => {
    return titleBBox.height + descriptionBBox.height + descriptionMarginTop + marginBottom;
  };

  const calculateRectWidth = (descriptionBBox, titleBBox, totalScoreWidth) => {
    const totalWidth = Math.max(
      titleBBox.width + totalScoreWidth + 50,
      descriptionBBox.width,
    ) + MARGIN_LEFT_RIGHT * 2;

    return totalWidth > MAX_WIDTH ? MAX_WIDTH + MARGIN_LEFT_RIGHT * 2 : totalWidth;
  };

  // Show/hide score elements
  const hasScore = d.technologyScore && d.technologyScore.trim();
  d3.select("#likedislike-icon").style("opacity", hasScore ? 1 : 0);
  d3.select("#score-text").style("opacity", hasScore ? 1 : 0);
  d3.select("#score-background").style("opacity", hasScore ? 1 : 0);

  // Setup content
  setTitleText(d.technologyName || d.label || 'Technology');
  score.text(hasScore ? d.technologyScore : '');
  
  const totalScoreWidth = hasScore ? calculateTotalScoreWidth() : 0;
  const titleBBox = getTitleSpecs();
  calculateDescriptionPosition(titleBBox);
  splitDescriptionIntoLines();
  
  const descriptionBBox = description.node().getBBox();
  const rectHeight = calculateRectHeight(descriptionBBox, titleBBox);
  const rectWidth = calculateRectWidth(descriptionBBox, titleBBox, totalScoreWidth);

  // Position elements
  title.attr("y", `${bottom ? MARGIN_TOP + 40 + rectHeight : MARGIN_TOP + 30}px`);
  
  description
    .attr("x", MARGIN_LEFT_RIGHT)
    .attr("y", `${bottom ? descriptionMarginTop + rectHeight + 45 : descriptionMarginTop + 30}px`);

  rect
    .attr("y", bottom ? rectHeight + 20 : -20 + 30)
    .attr("x", 0)
    .attr("width", rectWidth)
    .attr("height", rectHeight);

  score.attr(
    "transform",
    `translate(${
      rectWidth - totalScoreWidth + score.node().getComputedTextLength() -
      likeDislikeIcon.node().getBBox().width - MARGIN_SCORE_TO_ICON
    }, ${bottom ? rectHeight + 40 : 30})`,
  );

  likeDislikeIcon.attr(
    "transform",
    `translate(${
      rectWidth - totalScoreWidth + score.node().getComputedTextLength() -
      MARGIN_LEFT_RIGHT + 4
    },${bottom ? rectHeight + 23 : -17 + 30})`,
  );

  scoreBackground
    .attr("width", totalScoreWidth)
    .attr(
      "transform",
      `translate(${rectWidth - totalScoreWidth - MARGIN_LEFT_RIGHT + 10}, ${
        bottom ? rectHeight + 38 : -2 + 30
      })`,
    );

  bubble
    .attr(
      "transform",
      `translate(${
        right ? d.x - rectWidth / 2 + 60 : d.x - rectWidth / 2
      }, ${bottom ? d.y - rectHeight : d.y - rectHeight + 30})`,
    )
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.tooltipDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 1.0);

  rect
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.tooltipDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 0.85);
}

/**
 * Show lifecycle description tooltip
 */
function showLifecycleDescription(
  lifecycleName,
  lifecycleDescription,
  ringY,
  ringX,
  bubble,
  title,
  description,
  rect,
  likeDislikeIcon,
  score,
  scoreBackground
) {
  const maxWidth = 300;
  
  // Read current theme colors dynamically
  const colors = {
    surface: getCSSColor('--app-surface', '#ffffff'),
    borderLight: getCSSColor('--app-border-light', '#e0e6ed'),
    textPrimary: getCSSColor('--app-text-primary', '#1f2937'),
    textSecondary: getCSSColor('--app-text-secondary', '#374151')
  };
  
  // Move tooltip to end of DOM for proper z-index
  const parent = bubble.node().parentNode;
  parent.appendChild(bubble.node());
  
  // Make bubble interactive but initially invisible
  bubble
    .style("pointer-events", "all")
    .style("opacity", 0);
  
  // Apply current theme colors to tooltip elements
  rect
    .style("fill", colors.surface)
    .style("stroke", colors.borderLight);
    
  title.style("fill", colors.textPrimary);
  description.style("fill", colors.textSecondary);
  
  // Hide score elements
  likeDislikeIcon.style("opacity", 0);
  score.style("opacity", 0);
  scoreBackground.style("opacity", 0);

  title
    .text(lifecycleName)
    .attr("x", MARGIN_LEFT_RIGHT)
    .attr("y", `${MARGIN_TOP}px`);

  const titleBBox = title.node().getBBox();
  let descriptionMarginTop = 15 + titleBBox.height + MARGIN_TOP;

  description
    .attr("x", MARGIN_LEFT_RIGHT)
    .attr("y", `${descriptionMarginTop}px`);

  description.text(lifecycleDescription);
  
  // Split into lines
  const words = description.text().split(/\s+/);
  let tspan = description
    .text(null)
    .append("tspan")
    .attr("x", description.attr("x"));

  words.forEach((word) => {
    const textNode = tspan.text();
    tspan.text(textNode + word + " ");
    if (tspan.node().getComputedTextLength() > maxWidth) {
      tspan.text(textNode);
      tspan = description
        .append("tspan")
        .attr("x", description.attr("x"))
        .attr("dy", LINE_HEIGHT)
        .text(word + " ");
    }
  });

  const descriptionBBox = description.node().getBBox();
  const totalHeight = titleBBox.height + descriptionBBox.height + descriptionMarginTop + MARGIN_BOTTOM;
  const totalWidth = Math.max(titleBBox.width + 50, descriptionBBox.width) + MARGIN_LEFT_RIGHT * 2;
  
  const rectWidth = totalWidth > maxWidth ? maxWidth + MARGIN_LEFT_RIGHT * 2 : totalWidth;

  bubble
    .attr("transform", `translate(${ringX - rectWidth / 2}, ${ringY + 35})`)
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.tooltipDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 1);

  rect
    .attr("y", -25)
    .attr("x", 0)
    .attr("width", rectWidth)
    .attr("height", totalHeight)
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.tooltipDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 0.85);
}

function hideBubble(bubble) {
  bubble
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this).style("pointer-events", "none");
    });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;

  const truncatedText = text.slice(0, maxLength);
  const lastBreakIndex = truncatedText.lastIndexOf("\n");
  const lastSpaceIndex = truncatedText.lastIndexOf(" ");
  const lastIndex = Math.max(lastBreakIndex, lastSpaceIndex);

  if (lastIndex !== -1) {
    return truncatedText.slice(0, lastIndex).trim() + "...";
  }

  return truncatedText.trim() + "...";
}

/**
 * Render Markdown to HTML with fallback
 */
function renderMarkdownToHTML(markdownText) {
  if (typeof marked !== 'undefined') {
    try {
      return marked(markdownText);
    } catch (error) {
      console.warn('Marked library error, using fallback:', error);
    }
  }
  
  // Basic markdown fallback
  return markdownText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br/>');
}
