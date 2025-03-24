/**
 * 根据动画属性生成对应的CSS类名
 */
export function getAnimationClassName(
  animationType: "none" | "fade" | "slide",
  animationBehavior: "enter" | "exit" | "both",
  animationDirection?: "right" | "left" | "down" | "up"
): string {
  if (animationType === "none") return "";
  
  if (animationType === "fade") {
    if (animationBehavior === "enter") return "animate-fade-in";
    if (animationBehavior === "exit") return "animate-fade-out";
  }
  
  if (animationType === "slide") {
    if (animationBehavior === "enter") {
      if (animationDirection === "right") return "animate-slide-in-left";
      if (animationDirection === "left") return "animate-slide-in-right";
      if (animationDirection === "down") return "animate-slide-in-down";
      if (animationDirection === "up") return "animate-slide-in-up";
    }
    
    if (animationBehavior === "exit") {
      if (animationDirection === "right") return "animate-slide-out-right";
      if (animationDirection === "left") return "animate-slide-out-left";
      if (animationDirection === "down") return "animate-slide-out-down";
      if (animationDirection === "up") return "animate-slide-out-up";
    }
  }
  
  return "";
}