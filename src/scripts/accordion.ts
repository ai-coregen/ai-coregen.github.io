document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const content = trigger.nextElementSibling as HTMLElement;
    const chevron = trigger.querySelector("[data-chevron]") as HTMLElement;
    if (!content || !chevron) return;

    const isOpen =
      content.style.maxHeight !== "0px" && content.style.maxHeight !== "";

    if (isOpen) {
      content.style.maxHeight = "0px";
      chevron.classList.remove("rotate-180");
      trigger.closest("div")?.classList.remove("border-l-primary-500", "bg-primary-50/30");
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      chevron.classList.add("rotate-180");
      trigger.closest("div")?.classList.add("border-l-primary-500", "bg-primary-50/30");
    }
  });
});
