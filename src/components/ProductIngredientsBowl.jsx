import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { resolveProductBowlData } from '../utils/productBowlResolver';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export default function ProductIngredientsBowl({ product }) {
  const [activeIng, setActiveIng] = useState(0);
  const sectionRef = useRef(null);
  const bowlRef = useRef(null);
  const bowlLinesSvgRef = useRef(null);

  const bowlData = useMemo(() => resolveProductBowlData(product), [product]);
  const { subtitle, stickers, wedges } = bowlData;

  const activeWedgeAngle = wedges[activeIng]?.c ?? 330;
  const cut0 = (((activeWedgeAngle - 30) / 60) + 6) % 6;
  const cut1 = ((activeWedgeAngle + 30) / 60) % 6;

  const drawBowlLines = useCallback(() => {
    const bowl = bowlRef.current;
    const svg = bowlLinesSvgRef.current;
    if (!bowl || !svg) return;
    if (window.getComputedStyle(svg).display === 'none') return;

    const pins = Array.from(bowl.querySelectorAll('.ing__pin'));
    const spots = Array.from(bowl.querySelectorAll('.bowl__spot'));
    if (pins.length !== 6 || spots.length !== 6) return;

    const offsetToBowl = (el) => {
      let x = 0;
      let y = 0;
      let cur = el;
      while (cur && cur !== bowl) {
        x += cur.offsetLeft || 0;
        y += cur.offsetTop || 0;
        cur = cur.offsetParent;
      }
      return {
        x: x + el.offsetWidth / 2,
        y: y + el.offsetHeight / 2,
        r: el.offsetWidth / 2,
      };
    };

    const paths = [];
    for (let i = 0; i < 6; i++) {
      const a = offsetToBowl(pins[i]);
      const s = offsetToBowl(spots[i]);
      const dir = s.x > a.x ? 1 : -1;
      const ax = a.x + dir * (a.r + 6);
      const k = Math.abs(s.x - ax) * 0.55;
      const d = `M ${ax.toFixed(1)} ${a.y.toFixed(1)} C ${(ax + dir * k).toFixed(1)} ${a.y.toFixed(1)}, ${(s.x - dir * k * 0.5).toFixed(1)} ${s.y.toFixed(1)}, ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
      paths.push(d);
    }

    const baseLines = svg.querySelectorAll('.bowl__line');
    const onLines = svg.querySelectorAll('.bowl__line--on');
    paths.forEach((d, idx) => {
      if (baseLines[idx]) baseLines[idx].setAttribute('d', d);
      if (onLines[idx]) onLines[idx].setAttribute('d', d);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(drawBowlLines, 60);
    window.addEventListener('resize', drawBowlLines, { passive: true });

    let ro;
    if (typeof ResizeObserver !== 'undefined' && bowlRef.current) {
      ro = new ResizeObserver(() => drawBowlLines());
      ro.observe(bowlRef.current);
    }

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', drawBowlLines);
      if (ro) ro.disconnect();
    };
  }, [drawBowlLines, product]);

  useEffect(() => {
    const id = requestAnimationFrame(drawBowlLines);
    return () => cancelAnimationFrame(id);
  }, [activeIng, drawBowlLines]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const root = sectionRef.current;
        if (!root) {
          ticking = false;
          return;
        }
        const vh = window.innerHeight;
        const giantSpan = root.querySelector('.ing__giant span');
        if (giantSpan) {
          const rect = giantSpan.getBoundingClientRect();
          const p = clamp01((vh * 0.88 - rect.top) / (vh * 0.52 + rect.height * 0.35));
          giantSpan.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
        }

        const headEl = root.querySelector('.ing__head');
        if (headEl) {
          const rect = headEl.getBoundingClientRect();
          const p = clamp01((vh - rect.top) / (vh + rect.height));
          const stickerEls = root.querySelectorAll('.ing__head .sticker');
          stickerEls.forEach((el, i) => {
            const depth = parseFloat(el.style.getPropertyValue('--depth')) || 24;
            const sign = i % 2 === 1 ? -1 : 1;
            const ty = (0.5 - p) * depth;
            const rot = (p - 0.5) * 16 * sign;
            el.style.translate = `0 ${ty.toFixed(1)}px`;
            el.style.rotate = `calc(var(--r) + ${rot.toFixed(2)}deg)`;
          });
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [product]);

  if (!product) return null;

  return (
    <div ref={sectionRef} className="kibo-page kibo-bowl-section mt-8 md:mt-12">
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <symbol id="i-paw-bowl" viewBox="0 0 24 24">
          <g fill="currentColor">
            <ellipse cx="12" cy="16.2" rx="5.2" ry="4.4" />
            <ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-20 5.4 10.4)" />
            <ellipse cx="9.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(-8 9.5 6.3)" />
            <ellipse cx="14.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(8 14.5 6.3)" />
            <ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.6" transform="rotate(20 18.6 10.4)" />
          </g>
        </symbol>
      </svg>

      <section
        className="sec sec--ing card card--blush"
        id="ingredientes-plato"
        aria-labelledby="ing-product-title"
      >
        <div className="ing__head">
          <p className="pill-label">
            <svg className="paw" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#i-paw-bowl" />
            </svg>
            Lo que lleva cada plato
          </p>
          <h2 className="ing__giant" id="ing-product-title">
            <span>ingredientes</span>
          </h2>
          <span
            className="sticker"
            style={{ '--x': '6%', '--y': '18%', '--r': '-14deg', '--depth': 40 }}
            aria-hidden="true"
          >
            {stickers[0]}
          </span>
          <span
            className="sticker"
            style={{ '--x': '34%', '--y': '4%', '--r': '9deg', '--depth': 24 }}
            aria-hidden="true"
          >
            {stickers[1]}
          </span>
          <span
            className="sticker"
            style={{ '--x': '58%', '--y': '22%', '--r': '-7deg', '--depth': 32 }}
            aria-hidden="true"
          >
            {stickers[2]}
          </span>
          <span
            className="sticker"
            style={{ '--x': '82%', '--y': '6%', '--r': '15deg', '--depth': 20 }}
            aria-hidden="true"
          >
            {stickers[3]}
          </span>
          <p className="ing__sub">{subtitle}</p>
        </div>

        <div ref={bowlRef} className="bowl in">
          <ol className="bowl__list in">
            {wedges.map((item, idx) => {
              const isAct = activeIng === idx;
              return (
                <li key={item.num} style={{ '--i': idx }}>
                  <button
                    type="button"
                    className={`ing__pt ${isAct ? 'is-active' : ''}`}
                    aria-pressed={isAct}
                    onPointerEnter={(e) => {
                      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
                        setActiveIng(idx);
                      }
                    }}
                    onFocus={() => setActiveIng(idx)}
                    onClick={() => setActiveIng(idx)}
                  >
                    <span className="ing__pin" aria-hidden="true">
                      {item.num}
                    </span>
                    <span className="ing__name">{item.name}</span>
                    <span className="ing__pill">{item.pill}</span>
                    <span className="ing__desc">{item.desc}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <svg ref={bowlLinesSvgRef} className="bowl__lines" aria-hidden="true">
            {wedges.map((item, idx) => (
              <React.Fragment key={item.num}>
                <path className="bowl__line" />
                <path
                  className={`bowl__line--on ${activeIng === idx ? 'is-on' : ''}`}
                  pathLength="1"
                />
              </React.Fragment>
            ))}
          </svg>

          <div className="bowl__stage">
            <figure className="bowl__dish" data-ph="Bol con comida · vista cenital">
              <img
                src="https://media.kolpusites.com/kibory/bol.webp"
                alt={`Plato de ingredientes de ${product.name || 'la receta'}`}
                width="1847"
                height="1868"
                loading="lazy"
                decoding="async"
              />
            </figure>

            {wedges.map((item, idx) => (
              <span
                key={item.num}
                className={`bowl__wedge ${activeIng === idx ? 'is-active' : ''}`}
                data-c={item.c}
                style={{ '--p0': item.p0, '--pm': item.pm, '--p1': item.p1 }}
                aria-hidden="true"
              >
                <img src={item.img} alt="" width="1200" height="1200" />
              </span>
            ))}

            <svg className="bowl__cuts" viewBox="0 0 100 100" aria-hidden="true">
              {[
                [50, 6],
                [88.11, 28],
                [88.11, 72],
                [50, 94],
                [11.89, 72],
                [11.89, 28],
              ].map(([x2, y2], idx) => (
                <line
                  key={idx}
                  className={`bowl__cut ${idx === cut0 || idx === cut1 ? 'is-on' : ''}`}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                />
              ))}
            </svg>

            {wedges.map((item, idx) => (
              <span
                key={item.num}
                className={`bowl__spot ${activeIng === idx ? 'is-active' : ''}`}
                style={{ '--hx': item.hx, '--hy': item.hy, '--i': idx }}
                aria-hidden="true"
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
                    setActiveIng(idx);
                  }
                }}
                onClick={() => setActiveIng(idx)}
              >
                {item.num}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
