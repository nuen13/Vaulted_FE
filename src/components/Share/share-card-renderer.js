// -- file: src/components/Share/share-card-renderer.js
// Draws a shareable card for one media item onto a <canvas>:
// cover, title, category, status, your score (always), and optionally some reviews.

const API = import.meta.env.VITE_API_BASE_URL;

const W = 1080;          // card width (px); height grows with the reviews
const P = 64;            // outer padding
const COVER_W = 380;
const COVER_H = 540;
const COL_X = P + COVER_W + 48;
const COL_W = W - COL_X - P;
const FONT = '"Anonymous Pro", monospace';


// -- Cover loading: through the API proxy so the canvas can still be exported -- //
const coverCache = new Map();

export const loadCover = (url) => {
    if (!url) return Promise.resolve(null);
    if (!coverCache.has(url)) {
        coverCache.set(url, new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => { coverCache.delete(url); resolve(null); }; // draw the placeholder instead
            img.src = `${API}/Image/proxy?url=${encodeURIComponent(url)}`;
        }));
    }
    return coverCache.get(url);
};

export const ensureFonts = async () => {
    try {
        await Promise.all([
            document.fonts.load(`bold 52px ${FONT}`),
            document.fonts.load(`28px ${FONT}`),
        ]);
    } catch { /* fall back to monospace */ }
};


// -- Helpers -- //

// Pick white or near-black text, whichever reads better on the category color
const textColorFor = (hex) => {
    const n = parseInt((hex || '#d43b0c').slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.55 ? '#111111' : '#ffffff';
};

// Break text into at most maxLines lines that fit maxWidth; the last one gets "…" if cut
const wrapLines = (ctx, text, maxWidth, maxLines) => {
    const words = String(text ?? '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    const lines = [];
    let line = '';

    const pushLong = (word) => { // a single word wider than the line: hard-break it
        let part = '';
        for (const ch of word) {
            if (ctx.measureText(part + ch).width > maxWidth) { lines.push(part); part = ch; }
            else part += ch;
        }
        return part;
    };

    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth) { line = candidate; continue; }
        if (line) lines.push(line);
        line = ctx.measureText(word).width > maxWidth ? pushLong(word) : word;
    }
    if (line) lines.push(line);

    if (lines.length <= maxLines) return lines;
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
};

const drawCoverImage = (ctx, img, x, y, w, h) => {
    const scale = Math.max(w / img.width, h / img.height); // object-fit: cover
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
};

const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';


// -- Layout: measure everything first so the canvas height fits the content -- //
const layoutReviews = (ctx, reviews) => {
    ctx.font = `30px ${FONT}`;
    return reviews.map(review => ({
        meta: [`Consume #${review.consumeNumber}`, formatDate(review.dateCreated), review.rating != null ? `${review.rating}/10` : null]
            .filter(Boolean).join('  ·  '),
        lines: review.content ? wrapLines(ctx, review.content, W - P * 2, 5) : [],
    }));
};

const REVIEW_META_H = 40;
const REVIEW_LINE_H = 42;
const REVIEW_GAP = 40;

const reviewBlockHeight = (r) => REVIEW_META_H + r.lines.length * REVIEW_LINE_H;


/**
 * Draw the card.
 * @param {HTMLCanvasElement} canvas
 * @param {object} data { item, color, cover (Image|null), reviews: [{ consumeNumber, rating, content, dateCreated }] }
 */
export const renderShareCard = (canvas, { item, color, cover, reviews = [] }) => {
    const ctx = canvas.getContext('2d');
    const ink = textColorFor(color);
    const soft = ink === '#ffffff' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';
    const faint = ink === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';

    const laidOut = layoutReviews(ctx, reviews);
    const reviewsH = laidOut.length
        ? 70 + laidOut.reduce((sum, r) => sum + reviewBlockHeight(r), 0) + REVIEW_GAP * (laidOut.length - 1) + 56
        : 0;
    const H = P + COVER_H + 56 + reviewsH + 100 + P / 2;

    canvas.width = W;
    canvas.height = H;

    // Background: category color with a soft darkening toward the bottom
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    const shade = ctx.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'top';

    // -- Cover -- //
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(P, P, COVER_W, COVER_H, 28);
    ctx.clip();
    if (cover) {
        drawCoverImage(ctx, cover, P, P, COVER_W, COVER_H);
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(P, P, COVER_W, COVER_H);
        ctx.fillStyle = soft;
        ctx.font = `bold 160px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((item.mediaTitle?.trim().charAt(0) || '?').toUpperCase(), P + COVER_W / 2, P + COVER_H / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
    }
    ctx.restore();

    // -- Category chip -- //
    let y = P;
    ctx.font = `bold 24px ${FONT}`;
    const chip = (item.categoryName || 'uncategorized').toUpperCase();
    const chipW = Math.min(ctx.measureText(chip).width + 36, COL_W);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.roundRect(COL_X, y, chipW, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(chip, COL_X + 18, y + 11, COL_W - 36);
    y += 76;

    // -- Title (up to 4 lines) -- //
    ctx.fillStyle = ink;
    ctx.font = `bold 52px ${FONT}`;
    for (const line of wrapLines(ctx, item.mediaTitle || 'Untitled', COL_W, 4)) {
        ctx.fillText(line, COL_X, y);
        y += 62;
    }

    // -- Status -- //
    if (item.status) {
        y += 8;
        ctx.fillStyle = soft;
        ctx.font = `28px ${FONT}`;
        ctx.fillText(item.status, COL_X, y);
    }

    // -- Score: always shown, pinned to the bottom of the cover -- //
    const rating = Number(item.averageRating);
    const hasScore = item.averageRating != null && rating > 0;
    const barY = P + COVER_H - 14;
    const numberY = barY - 30 - 150;

    ctx.fillStyle = soft;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText('MY SCORE', COL_X, numberY - 40);

    ctx.fillStyle = ink;
    ctx.font = `bold 150px ${FONT}`;
    const scoreText = hasScore ? rating.toFixed(1) : '–';
    ctx.fillText(scoreText, COL_X - 6, numberY);
    const scoreW = ctx.measureText(scoreText).width;
    ctx.fillStyle = soft;
    ctx.font = `48px ${FONT}`;
    ctx.fillText('/10', COL_X + scoreW + 8, numberY + 82);

    ctx.fillStyle = faint;
    ctx.beginPath();
    ctx.roundRect(COL_X, barY, COL_W, 14, 7);
    ctx.fill();
    if (hasScore) {
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.roundRect(COL_X, barY, Math.max(14, COL_W * Math.min(rating, 10) / 10), 14, 7);
        ctx.fill();
    }

    // -- Reviews (optional) -- //
    y = P + COVER_H + 56;
    if (laidOut.length) {
        ctx.fillStyle = soft;
        ctx.font = `bold 24px ${FONT}`;
        ctx.fillText(laidOut.length === 1 ? 'MY REVIEW' : 'MY REVIEWS', P, y);
        y += 70;

        laidOut.forEach((review, index) => {
            if (index > 0) {
                ctx.fillStyle = faint;
                ctx.fillRect(P, y - REVIEW_GAP / 2, W - P * 2, 2);
            }
            ctx.fillStyle = soft;
            ctx.font = `bold 26px ${FONT}`;
            ctx.fillText(review.meta, P, y);
            y += REVIEW_META_H;

            ctx.fillStyle = ink;
            ctx.font = `30px ${FONT}`;
            for (const line of review.lines) {
                ctx.fillText(line, P, y);
                y += REVIEW_LINE_H;
            }
            y += REVIEW_GAP;
        });
        y += 56 - REVIEW_GAP;
    }

    // -- Footer -- //
    ctx.fillStyle = faint;
    ctx.fillRect(P, y, W - P * 2, 2);
    y += 34;
    ctx.fillStyle = ink;
    ctx.font = `bold 30px ${FONT}`;
    ctx.fillText('Media: Vaulted', P, y);
    ctx.fillStyle = soft;
    ctx.font = `24px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(formatDate(new Date()), W - P, y + 4);
    ctx.textAlign = 'left';
};

export const canvasToBlob = (canvas) => new Promise((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not create the image'))), 'image/png'));
