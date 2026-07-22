function initHomeHeroEntrance() {
  const hero = document.querySelector("#home-hero");
  const navbarComp = document.querySelector(".nav_component");

  if (!hero || typeof gsap === "undefined") return;

  const primary = hero.querySelectorAll("[primary]");
  const secondary = hero.querySelectorAll("[secondary]");
  const tertiary = hero.querySelectorAll("[tertiary]");

  function getVisualLines(element) {
    const lineWrappers = [...element.querySelectorAll(".line")];
    if (lineWrappers.length) return lineWrappers.map((line) => [line]);

    const chars = [...element.querySelectorAll(".char")];
    if (!chars.length) return [[element]];

    return chars.reduce((lines, char) => {
      const top = Math.round(char.getBoundingClientRect().top);
      const currentLine = lines.at(-1);

      if (!currentLine || Math.abs(currentLine.top - top) > 2) {
        lines.push({ top, targets: [char] });
      } else {
        currentLine.targets.push(char);
      }

      return lines;
    }, []).map((line) => line.targets);
  }

  const primaryLines = [...primary].flatMap(getVisualLines);
  const secondaryLines = [...secondary].flatMap(getVisualLines);
  const revealTargets = [
    ...primaryLines.flat(),
    ...secondaryLines.flat(),
    ...tertiary
  ];

  if (!revealTargets.length) return;

  gsap.set(revealTargets, {
    willChange: "opacity, filter"
  });
  if (navbarComp) {
    gsap.set(navbarComp, { yPercent: -100, willChange: "transform" });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(revealTargets, {
      opacity: 1,
      filter: "none"
    });
    if (navbarComp) gsap.set(navbarComp, { yPercent: 0 });
    return;
  }

  const timeline = gsap.timeline({
    defaults: { duration: 0.7, ease: "power4.out" }
  });

  const textLines = [...primaryLines, ...secondaryLines].sort((lineA, lineB) => {
    const rectA = lineA[0].getBoundingClientRect();
    const rectB = lineB[0].getBoundingClientRect();
    return rectA.top - rectB.top || rectA.left - rectB.left;
  });
  textLines.forEach((line, index) => {
    timeline.from(
      line,
      {
        opacity: 0,
        filter: "blur(10px)",
        duration: 1,
        ease: "power2.out"
      },
      index * 0.2
    );
  });

  if (tertiary.length) {
    const tertiaryPosition =
      secondaryLines.length || primaryLines.length ? "-=0.9" : 0;

    timeline.addLabel("tertiaryStart", tertiaryPosition);
    timeline.from(
      tertiary,
      {
        opacity: 0,
        filter: "blur(10px)"
      },
      "tertiaryStart"
    );

    if (navbarComp) {
      timeline.to(navbarComp, { yPercent: 0 }, "tertiaryStart");
    }
  }

  timeline.set(revealTargets, {
    clearProps: "filter,willChange"
  });
  if (navbarComp) timeline.set(navbarComp, { clearProps: "transform,willChange" });
}

function initSectionHeadReveals() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const sectionHeads = gsap.utils.toArray("[section-head]");
  const sectionHeadTags = gsap.utils.toArray("[section-head-tag]");
  const sectionButtons = gsap.utils.toArray("[section-btn]");
  if (!sectionHeads.length && !sectionHeadTags.length && !sectionButtons.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set("[section-head] .char, [section-head] p, [section-head-tag] .char, [section-btn]", {
      opacity: 1,
      filter: "none",
      y: 0
    });
    return;
  }

  sectionHeads.forEach((heading) => {
    const chars = [...heading.querySelectorAll(".char")].filter(
      (char) => !char.closest("p")
    );
    const lines = chars.reduce((groups, char) => {
      const rect = char.getBoundingClientRect();
      const top = Math.round(rect.top);
      let line = groups.find((group) => Math.abs(group.top - top) <= 2);

      if (!line) {
        line = { top, left: rect.left, targets: [] };
        groups.push(line);
      }

      line.targets.push(char);
      line.left = Math.min(line.left, rect.left);
      return groups;
    }, []).sort((lineA, lineB) =>
      lineA.top - lineB.top || lineA.left - lineB.left
    );
    const paragraphs = heading.querySelectorAll("p");
    if (!lines.length && !paragraphs.length) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    if (lines.length) {
      lines.forEach((line, index) => {
        timeline.from(
          line.targets,
          {
            opacity: 0,
            filter: "blur(10px)",
            duration: 1,
            ease: "power2.out",
            clearProps: "filter,willChange"
          },
          index * 0.2
        );
      });
    }

    if (paragraphs.length) {
      timeline.from(
        paragraphs,
        {
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.7,
          ease: "power4.out",
          clearProps: "filter,willChange"
        },
        0
      );
    }
  });

  sectionHeadTags.forEach((tag) => {
    const chars = tag.querySelectorAll(".char");
    if (!chars.length) return;

    gsap.from(chars, {
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.7,
      ease: "power4.out",
      stagger: 0.025,
      clearProps: "filter,willChange",
      scrollTrigger: {
        trigger: tag,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });

  sectionButtons.forEach((button) => {
    gsap.from(button, {
      y: 24,
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.7,
      ease: "power4.out",
      clearProps: "filter,transform,willChange",
      scrollTrigger: {
        trigger: button,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });
}

function initTextAnimations() {
  initHomeHeroEntrance();
  initSectionHeadReveals();
}

if (document.readyState !== "complete") {
  window.addEventListener("load", initTextAnimations, { once: true });
} else {
  initTextAnimations();
}
