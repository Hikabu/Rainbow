export function fadeout(element, length_in_s = 1){
	element.style.transition = `opacity ${length_in_s}s ease`;
	element.style.opacity = "0";
}

export function doublePump(element, factorGrow = 0.1, factorShrink = 0.1) {
	element.style.transformOrigin = "center center";

	element.style.transition = "transform 0.1s ease";
	element.style.transform = `scale(${1 + factorGrow}) `;
	setTimeout(() => {
	  element.style.transform = `scale(${1 - factorShrink}) `;
	  setTimeout(() => {
		element.style.transform = "scale(1.0)";
	  }, 200);
	}, 200);
  }
  