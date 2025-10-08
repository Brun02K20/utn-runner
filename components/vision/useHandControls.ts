// The hand control logic is handled by the HandControlContext
export const useHandControls = () => {
  return {
    lane: null as "left" | "center" | "right" | null,
    jump: false,
  }
}
