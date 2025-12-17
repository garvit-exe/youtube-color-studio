// Default settings
let currentSettings = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hue: 0,
    sepia: 0,
    grayscale: 0,
};

// 1. Function to apply the CSS filters to the video
function applyFilters() {
    const video = document.querySelector("video");
    if (!video) return;

    video.style.filter = `
        brightness(${currentSettings.brightness}%) 
        contrast(${currentSettings.contrast}%) 
        saturate(${currentSettings.saturate}%) 
        hue-rotate(${currentSettings.hue}deg) 
        sepia(${currentSettings.sepia}%) 
        grayscale(${currentSettings.grayscale}%)
    `;
}

// 2. Create the HTML for our panel
function createControlPanel() {
    // Prevent creating duplicate panels
    if (document.getElementById("yt-color-studio-container")) return;

    const container = document.createElement("div");
    container.id = "yt-color-studio-container";

    container.innerHTML = `
        <div class="studio-header">
            <span class="studio-title">🎨 Color Studio</span>
            <button id="studio-toggle-btn" class="studio-btn">Hide Controls</button>
        </div>
        
        <div class="studio-controls" id="studio-controls-box">
            ${createSliderHTML("Brightness", "brightness", 0, 200, 100, "%")}
            ${createSliderHTML("Contrast", "contrast", 0, 200, 100, "%")}
            ${createSliderHTML("Saturation", "saturate", 0, 300, 100, "%")}
            ${createSliderHTML("Hue Rotate", "hue", 0, 360, 0, "deg")}
            ${createSliderHTML("Sepia", "sepia", 0, 100, 0, "%")}
            ${createSliderHTML("Grayscale", "grayscale", 0, 100, 0, "%")}
        </div>

        <div class="studio-buttons">
            <button id="studio-reset" class="studio-btn reset">Reset All</button>
            <button id="studio-preset-matrix" class="studio-btn">Matrix Mode</button>
            <button id="studio-preset-warm" class="studio-btn">Warm & Cozy</button>
        </div>
    `;

    // Where do we insert? "secondary" is the area below the video and title
    // "ytd-watch-metadata" is the container for title/likes/description
    const targetArea =
        document.querySelector("#secondary") ||
        document.querySelector("#columns");
    const metaData = document.querySelector("ytd-watch-metadata");

    if (metaData) {
        // Insert AFTER the metadata (title/buttons) so it sits nicely below
        metaData.parentNode.insertBefore(container, metaData.nextSibling);
        attachEventListeners();
    }
}

// Helper to generate slider HTML
function createSliderHTML(label, id, min, max, val, unit) {
    return `
        <div class="control-group">
            <label>${label} <span id="val-${id}">${val}${unit}</span></label>
            <input type="range" id="${id}" min="${min}" max="${max}" value="${val}" data-unit="${unit}">
        </div>
    `;
}

// 3. Attach Logic to Sliders and Buttons
function attachEventListeners() {
    const inputs = document.querySelectorAll(
        "#yt-color-studio-container input"
    );

    inputs.forEach((input) => {
        input.addEventListener("input", (e) => {
            const id = e.target.id;
            const val = e.target.value;
            const unit = e.target.dataset.unit;

            // Update the text label number
            document.getElementById(`val-${id}`).innerText = val + unit;

            // Update global settings object
            currentSettings[id] = val;
            applyFilters();
        });
    });

    // Reset Button
    document.getElementById("studio-reset").addEventListener("click", () => {
        currentSettings = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            hue: 0,
            sepia: 0,
            grayscale: 0,
        };
        updateSlidersUI();
        applyFilters();
    });

    // Matrix Preset
    document
        .getElementById("studio-preset-matrix")
        .addEventListener("click", () => {
            currentSettings = {
                brightness: 110,
                contrast: 120,
                saturate: 150,
                hue: 90,
                sepia: 0,
                grayscale: 0,
            };
            updateSlidersUI();
            applyFilters();
        });

    // Warm Preset
    document
        .getElementById("studio-preset-warm")
        .addEventListener("click", () => {
            currentSettings = {
                brightness: 105,
                contrast: 100,
                saturate: 120,
                hue: 0,
                sepia: 40,
                grayscale: 0,
            };
            updateSlidersUI();
            applyFilters();
        });

    // Hide/Show Toggle
    const controlsBox = document.getElementById("studio-controls-box");
    const toggleBtn = document.getElementById("studio-toggle-btn");
    toggleBtn.addEventListener("click", () => {
        if (controlsBox.style.display === "none") {
            controlsBox.style.display = "grid";
            toggleBtn.innerText = "Hide Controls";
        } else {
            controlsBox.style.display = "none";
            toggleBtn.innerText = "Show Controls";
        }
    });
}

function updateSlidersUI() {
    for (const [key, value] of Object.entries(currentSettings)) {
        const input = document.getElementById(key);
        if (input) {
            input.value = value;
            const unit = input.dataset.unit;
            document.getElementById(`val-${key}`).innerText = value + unit;
        }
    }
}

// 4. Watch for YouTube page changes (SPA Navigation)
const observer = new MutationObserver((mutations) => {
    // If the video exists but our panel doesn't, inject it
    if (
        document.querySelector("video") &&
        !document.getElementById("yt-color-studio-container")
    ) {
        // We wait slightly to ensure YouTube's layout is settled
        setTimeout(createControlPanel, 1000);
    }
    // Re-apply filters if video source changes (e.g. ad to video)
    if (document.querySelector("video")) {
        applyFilters();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
