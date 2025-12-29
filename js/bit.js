/* 

EventEmitter based on: 
https://netbasal.com/javascript-the-magic-behind-event-emitter-cce3abcbcef9
*/
class EventEmitter {
    constructor() {
        this.events = {};
    }
    emit(event, ...args) {
        const handlers = this.events[event];
        if (handlers) {
            handlers.forEach(fn => fn.call(null, ...args));
        } else {
            this.log(`[BIT-00
                00]: The Event you called: ${event} doesn't exist anymore, register it with: bit.on()`);
        }
    }
    on(event, handler) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(handler);
    }
}

/* Bit created by Zain Ali */
class Bit extends EventEmitter {
    constructor(element, options = {}) {
        super();
        this.id = `bit-${this.get_random_key()}`;
        this.version = "0.1";
        this.slogan = "";
        this.files = [];
        this.upload_url = options.upload_url || '';
        this.headers = options.headers || {};
        this.element = element;
        this.max_args_num = 5; // will deprecate
        this.mode = 'dev';
        this.max_scan = 1;
        this.initI18N();
        this.language = this.validateLanguage(options.language);
        this.fallBackLanguage = options.fallBackLanguage;
        this.fallBackAddedFileBlobType = options.fallBackAddedFileBlobType;
        this.maxFiles = options.maxFiles || Infinity;
        this.friendlyName = options.friendlyName || '';

        // plugins system
        this.plugins = [];
        this.DOM_IDS = {
            'HIDDEN_INPUT': '#bit__hidden__input',
        };

        this.icons = {
            DELETE_ICON: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>`,
            EDIT_ICON: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>`
        };

        this.i18n = this.get_i18n_dict();
        Object.assign(this.i18n, this.icons);

        this.element.bit = this;
        this.init();
    }

    static getAllBitInstances() {
        const instances = [];
        const elements = document.querySelectorAll('*');
        for (const element of elements) {
            if (element.bit instanceof Bit) {
                instances.push(element.bit);
            }
        }
        return instances;
    }

    static getBitInstanceByFriendlyName(friendlyName) {
        return Bit.getAllBitInstances().find(bit => bit.friendlyName === friendlyName) || null;
    }

    initI18N() {
        this.i18n_dict = {
            'en': {
                DRAG_AND_DROP_TEXT: 'Drag/Drop your files for uploading...',
                DELETE_FILE: 'delete',
            },
            'it': {
                DRAG_AND_DROP_TEXT: 'Trascina i files o clicca per caricare...',
                DELETE_FILE: 'cancella',
            }
        };
    }

    validateLanguage(language) {
        if (!this.i18n_dict[language]) {
            console.warn(`[BIT-0001]: Language '${language}' is not supported. Falling back to 'en'.`);
            return this.fallBackLanguage || 'en';
        }
        return language;
    }

    get_random_key() {
        return Math.random().toString(16).substring(2) + Date.now();
    }

    log(...args) {
        if (this.mode !== 'dev') return;
        for (let i = 0; i < args.length && i < this.max_args_num; i++) {
            console.log('[BIT.JS]:', args[i]);
        }
    }

    rebuildIndexes() {
        let elems = this.element.querySelectorAll('.bit-core-item');
        elems.forEach((item, index) => {
            item.file.index = index;
            this.updateWithToken(item.file.token, { 'sort_order': index });
        });
    }

    showDropIndicator(targetItem) {
        this.clearDropIndicators();
        targetItem.classList.add('drag-over');
    }

    clearDropIndicators() {
        this.element.querySelectorAll('.bit-core-item').forEach(item => {
            item.classList.remove('drag-over', 'drag-over-previous', 'drag-over-next');
        });
    }

    showModal(src) {
        let modal = document.querySelector('.image-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.innerHTML = `
                <button class="image-modal-close">&times;</button>
                <img src="${src}" alt="Full size preview">
            `;
            document.body.appendChild(modal);
            
            modal.querySelector('.image-modal-close').onclick = () => {
                modal.classList.remove('active');
            };
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            };
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            });
        } else {
            modal.querySelector('img').src = src;
        }
        modal.classList.add('active');
    }

    openEditor(file) {
        let editor = document.querySelector('.image-editor');
        if (!editor) {
            this.createEditor();
            editor = document.querySelector('.image-editor');
        }
        
        this.currentEditingFile = file;
        
        const canvas = editor.querySelector('#image-canvas');
        const ctx = canvas.getContext('2d');
        const cropOverlay = editor.querySelector('#crop-overlay');
        
        cropOverlay.classList.remove('active');
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const maxWidth = 600;
            const maxHeight = 400;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            this.originalImageData = ctx.getImageData(0, 0, width, height);
            this.resetFilters();
            
            const displayWidth = width * 1;
            const displayHeight = height * 1;
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
        };
        img.src = file.src;
        
        document.querySelector('.image-modal.active:not(.image-editor)')?.classList.remove('active');
        editor.classList.add('active');
    }

    createEditor() {
        const editor = document.createElement('div');
        editor.className = 'image-modal active image-editor';
        editor.innerHTML = `
            <button class="image-modal-close">&times;</button>
            <div class="image-editor-header">
                <div class="image-editor-title">Edit Image</div>
            </div>
            <div class="image-editor-content">
                <div class="image-editor-canvas-container" id="canvas-container">
                    <canvas class="image-editor-canvas" id="image-canvas"></canvas>
                    <div class="crop-overlay" id="crop-overlay">
                        <div class="crop-grid">
                            <div class="crop-grid-line vertical" style="left: 33.33%"></div>
                            <div class="crop-grid-line vertical" style="left: 66.66%"></div>
                            <div class="crop-grid-line horizontal" style="top: 33.33%"></div>
                            <div class="crop-grid-line horizontal" style="top: 66.66%"></div>
                        </div>
                        <div class="crop-handle nw" data-handle="nw"></div>
                        <div class="crop-handle n" data-handle="n"></div>
                        <div class="crop-handle ne" data-handle="ne"></div>
                        <div class="crop-handle e" data-handle="e"></div>
                        <div class="crop-handle se" data-handle="se"></div>
                        <div class="crop-handle s" data-handle="s"></div>
                        <div class="crop-handle sw" data-handle="sw"></div>
                        <div class="crop-handle w" data-handle="w"></div>
                        <div class="crop-border top"></div>
                        <div class="crop-border right"></div>
                        <div class="crop-border bottom"></div>
                        <div class="crop-border left"></div>
                    </div>
                </div>
                <div class="image-editor-controls">
                    <div class="image-editor-section">
                        <div class="image-editor-section-title">Filters</div>
                        <div class="image-editor-control">
                            <label>Brightness: <span id="brightness-value">100</span>%</label>
                            <input type="range" id="brightness" min="0" max="200" value="100">
                        </div>
                        <div class="image-editor-control">
                            <label>Contrast: <span id="contrast-value">100</span>%</label>
                            <input type="range" id="contrast" min="0" max="200" value="100">
                        </div>
                        <div class="image-editor-control">
                            <label>Saturation: <span id="saturation-value">100</span>%</label>
                            <input type="range" id="saturation" min="0" max="200" value="100">
                        </div>
                        <div class="image-editor-control">
                            <label>Blur: <span id="blur-value">0</span>px</label>
                            <input type="range" id="blur" min="0" max="20" value="0">
                        </div>
                    </div>
                    <div class="image-editor-section">
                        <div class="image-editor-section-title">Crop</div>
                        <div class="image-editor-control">
                            <label>Aspect Ratio</label>
                            <select id="crop-ratio" style="width: 100%; padding: 8px; background: #222; color: #fff; border: 1px solid #444;">
                                <option value="free">Free</option>
                                <option value="1:1">1:1 Square</option>
                                <option value="16:9">16:9 Widescreen</option>
                                <option value="4:3">4:3 Standard</option>
                                <option value="3:2">3:2 Photo</option>
                                <option value="9:16">9:16 Portrait</option>
                            </select>
                        </div>
                        <button id="toggle-crop" class="image-editor-btn" style="width: 100%; margin-top: 8px;">Toggle Crop Overlay</button>
                        <button id="apply-crop" class="image-editor-btn" style="width: 100%; margin-top: 8px;">Apply Crop</button>
                    </div>
                    <div class="image-editor-section">
                        <div class="image-editor-section-title">Zoom</div>
                        <div class="image-editor-control">
                            <label>Zoom: <span id="zoom-value">100</span>%</label>
                            <input type="range" id="zoom" min="10" max="300" value="100">
                        </div>
                    </div>
                    <div class="image-editor-buttons">
                        <button id="reset-filters" class="image-editor-btn">Reset</button>
                        <button id="cancel-edit" class="image-editor-btn">Cancel</button>
                        <button id="apply-edit" class="image-editor-btn primary">Apply</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(editor);
        
        this.setupEditorControls(editor);
    }

    setupEditorControls(editor) {
        const canvas = editor.querySelector('#image-canvas');
        const ctx = canvas.getContext('2d');
        const container = editor.querySelector('#canvas-container');
        const cropOverlay = editor.querySelector('#crop-overlay');
        
        let cropState = {
            active: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            ratio: null
        };
        
        let zoomLevel = 100;
        let panX = 0;
        let panY = 0;
        let isDragging = false;
        let isPanning = false;
        let dragHandle = null;
        let startX, startY, startCropX, startCropY, startCropWidth, startCropHeight;
        
        const filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0
        };
        
        const applyZoom = () => {
            const displayWidth = canvas.width * (zoomLevel / 100);
            const displayHeight = canvas.height * (zoomLevel / 100);
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
        };
        
        const applyFilters = () => {
            ctx.putImageData(this.originalImageData, 0, 0);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
            tempCtx.drawImage(canvas, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
            applyZoom();
        };
        
        const updateCropOverlay = () => {
            const canvasRect = canvas.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const displayWidth = canvas.width * (zoomLevel / 100);
            const displayHeight = canvas.height * (zoomLevel / 100);
            
            const offsetX = canvasRect.left - containerRect.left;
            const offsetY = canvasRect.top - containerRect.top;
            
            if (!cropState.active) {
                cropState.x = offsetX + 10;
                cropState.y = offsetY + 10;
                cropState.width = displayWidth - 20;
                cropState.height = displayHeight - 20;
            }
            
            if (cropState.ratio) {
                const [w, h] = cropState.ratio.split(':').map(Number);
                const targetRatio = w / h;
                const currentRatio = cropState.width / cropState.height;
                
                if (currentRatio > targetRatio) {
                    cropState.width = cropState.height * targetRatio;
                } else {
                    cropState.height = cropState.width / targetRatio;
                }
            }
            
            cropOverlay.style.left = cropState.x + 'px';
            cropOverlay.style.top = cropState.y + 'px';
            cropOverlay.style.width = cropState.width + 'px';
            cropOverlay.style.height = cropState.height + 'px';
        };
        
        editor.querySelectorAll('input[type="range"]').forEach(input => {
            if (input.id === 'zoom') return;
            input.addEventListener('input', (e) => {
                filters[e.target.id] = parseInt(e.target.value);
                editor.querySelector(`#${e.target.id}-value`).textContent = e.target.value;
                applyFilters();
                if (cropState.active) updateCropOverlay();
            });
        });
        
        editor.querySelector('#zoom').addEventListener('input', (e) => {
            zoomLevel = parseInt(e.target.value);
            editor.querySelector('#zoom-value').textContent = zoomLevel;
            applyFilters();
            if (cropState.active) updateCropOverlay();
        });
        
        editor.querySelector('#reset-filters').onclick = () => {
            this.resetFilters();
            Object.keys(filters).forEach(key => {
                filters[key] = key === 'blur' ? 0 : 100;
                editor.querySelector(`#${key}`).value = filters[key];
                editor.querySelector(`#${key}-value`).textContent = filters[key];
            });
            zoomLevel = 100;
            editor.querySelector('#zoom').value = 100;
            editor.querySelector('#zoom-value').textContent = 100;
            applyFilters();
        };
        
        editor.querySelector('#cancel-edit').onclick = () => {
            editor.classList.remove('active');
        };
        
        editor.querySelector('.image-modal-close').onclick = () => {
            editor.classList.remove('active');
        };
        
        editor.onclick = (e) => {
            if (e.target === editor) {
                editor.classList.remove('active');
            }
        };
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && editor.classList.contains('active')) {
                editor.classList.remove('active');
            }
        });
        
        editor.querySelector('#apply-edit').onclick = () => {
            const newSrc = canvas.toDataURL('image/png');
            this.currentEditingFile.src = newSrc;
            
            const preview = document.querySelector(`[data-token="${this.currentEditingFile.token}"]`)?.closest('.bit-core-item')?.querySelector('.bit-preview-wrapper');
            if (preview) {
                preview.style.backgroundImage = `url('${newSrc}')`;
            }
            
            editor.classList.remove('active');
        };
        
        editor.querySelector('#toggle-crop').onclick = () => {
            cropState.active = !cropState.active;
            cropOverlay.classList.toggle('active', cropState.active);
            updateCropOverlay();
        };
        
        editor.querySelector('#crop-ratio').addEventListener('change', (e) => {
            cropState.ratio = e.target.value === 'free' ? null : e.target.value;
            if (cropState.active) {
                updateCropOverlay();
            }
        });
        
        const handleResize = (handle, dx, dy) => {
            const minSize = 50;
            
            switch (handle) {
                case 'nw':
                    cropState.x += dx;
                    cropState.y += dy;
                    cropState.width -= dx;
                    cropState.height -= dy;
                    break;
                case 'n':
                    cropState.y += dy;
                    cropState.height -= dy;
                    break;
                case 'ne':
                    cropState.y += dy;
                    cropState.width += dx;
                    cropState.height -= dy;
                    break;
                case 'e':
                    cropState.width += dx;
                    break;
                case 'se':
                    cropState.width += dx;
                    cropState.height += dy;
                    break;
                case 's':
                    cropState.height += dy;
                    break;
                case 'sw':
                    cropState.x += dx;
                    cropState.width -= dx;
                    cropState.height += dy;
                    break;
                case 'w':
                    cropState.x += dx;
                    cropState.width -= dx;
                    break;
            }
            
            if (cropState.width < minSize) cropState.width = minSize;
            if (cropState.height < minSize) cropState.height = minSize;
            
            updateCropOverlay();
        };
        
        cropOverlay.addEventListener('mousedown', (e) => {
            if (!cropState.active) return;
            
            const handle = e.target.dataset.handle;
            
            if (handle) {
                isDragging = true;
                dragHandle = handle;
                startX = e.clientX;
                startY = e.clientY;
                startCropX = cropState.x;
                startCropY = cropState.y;
                startCropWidth = cropState.width;
                startCropHeight = cropState.height;
            } else {
                isPanning = true;
                startX = e.clientX;
                startY = e.clientY;
                startCropX = cropState.x;
                startCropY = cropState.y;
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging && dragHandle) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                handleResize(dragHandle, dx, dy);
                startX = e.clientX;
                startY = e.clientY;
            } else if (isPanning) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                cropState.x = startCropX + dx;
                cropState.y = startCropY + dy;
                updateCropOverlay();
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            isPanning = false;
            dragHandle = null;
        });
        
        editor.querySelector('#apply-crop').onclick = () => {
            if (!cropState.active) return;
            
            const scaleX = canvas.width / canvas.offsetWidth;
            const scaleY = canvas.height / canvas.offsetHeight;
            
            const cropX = (cropState.x - canvas.offsetLeft) * scaleX;
            const cropY = (cropState.y - canvas.offsetTop) * scaleY;
            const cropWidth = cropState.width * scaleX;
            const cropHeight = cropState.height * scaleY;
            
            ctx.putImageData(this.originalImageData, 0, 0);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            ctx.drawImage(tempCanvas, 0, 0);
            
            this.originalImageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
            cropState.active = false;
            cropOverlay.classList.remove('active');
            applyFilters();
        };
    }

    resetFilters() {
        const editor = document.querySelector('.image-editor');
        if (editor) {
            ['brightness', 'contrast', 'saturation', 'blur'].forEach(filter => {
                const value = filter === 'blur' ? 0 : 100;
                editor.querySelector(`#${filter}`).value = value;
                editor.querySelector(`#${filter}-value`).textContent = value;
            });
        }
    }

    createBitItem(file) {
        let e = document.createElement('div');
        const file_type = file.type.replace('image/', '');
        file.token = `bitimage-${this.get_random_key()}.${file_type}`;
        e.file = file;
        e.className = "bit-core-item";
        e.draggable = true;
        e.setAttribute('data-token', file.token);
        e.innerHTML = `<div class="bit-preview-wrapper">
        <div class="bit-drag-handle">⋮⋮</div>
        <button type="button" class="bit-edit-item-btn" data-token="${file.token}">${this.i18n.EDIT_ICON}</button>
        <button type="button" class="bit-delete-item-btn" data-token="${file.token}">${this.i18n.DELETE_ICON}</button>
        </div>`;
        e.querySelector('.bit-preview-wrapper').style.backgroundImage = `url('${file.src}')`;
        let t = this;
        e.onclick = function (ev) {
            if (ev.target.closest('.bit-delete-item-btn') || ev.target.closest('.bit-edit-item-btn')) return;
            ev.stopPropagation();
            t.showModal(e.file.src);
            t.emit('bit_item_click', { 'element': e });
        };

        e.querySelector('.bit-edit-item-btn').onclick = (ev) => {
            ev.stopPropagation();
            t.openEditor(e.file);
        };

        e.addEventListener('dragstart', (ev) => {
            e.classList.add('dragging');
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData('text/plain', file.token);
        });

        e.addEventListener('dragenter', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        });

        e.addEventListener('dragend', () => {
            e.classList.remove('dragging');
            this.clearDropIndicators();
        });

        e.addEventListener('dragover', (ev) => {
            if (e.classList.contains('dragging')) return;
            ev.preventDefault();
            ev.stopPropagation();
            ev.dataTransfer.dropEffect = 'move';
            
            const rect = e.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            
            if (ev.clientX < midpoint) {
                e.classList.remove('drag-over-next');
                e.classList.add('drag-over', 'drag-over-previous');
            } else {
                e.classList.remove('drag-over-previous');
                e.classList.add('drag-over', 'drag-over-next');
            }
        });

        e.addEventListener('dragleave', (ev) => {
            ev.stopPropagation();
            e.classList.remove('drag-over', 'drag-over-previous', 'drag-over-next');
        });

        e.addEventListener('drop', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (e.classList.contains('dragging')) return;
            
            const draggedToken = ev.dataTransfer.getData('text/plain');
            if (!draggedToken) return;
            
            const draggedItem = this.element.querySelector(`[data-token="${draggedToken}"]`);
            
            if (draggedItem && draggedItem !== e) {
                const targetElement = ev.target.closest('.bit-core-item');
                if (!targetElement) return;
                
                if (e.classList.contains('drag-over-previous')) {
                    this.element.insertBefore(draggedItem, targetElement);
                    this.emit('sort', { moved: draggedItem, target: targetElement, position: 'before' });
                } else if (e.classList.contains('drag-over-next')) {
                    this.element.insertBefore(draggedItem, targetElement.nextSibling);
                    this.emit('sort', { moved: draggedItem, target: targetElement, position: 'after' });
                }
                
                this.rebuildIndexes();
            }
            
            e.classList.remove('drag-over', 'drag-over-previous', 'drag-over-next');
        });

        // sort-left/right removed; use drag-and-drop for sorting


        e.querySelector('.bit-delete-item-btn').onclick = (ev) => {
            ev.stopPropagation();
            const response = (t.mode != "dev") ? confirm(t.i18n.DELETE_FILE) : true;
            t.emit('delete', e.file, response);

            if (response) {
                const index = this.files.findIndex(i => i.token == e.file.token);
                if (index > -1) {
                    this.files.splice(index, 1);
                }
                e.remove();
            }
        };
        this.element.appendChild(e);
        this.rebuildIndexes();
    }

    show_images(file) {
        if (file) {
            this.createBitItem(file);
            file.index = 1;
            file.already_parsed = true;
        } else {
            this.files.forEach((i, index) => {
                if (i.already_parsed) return;
                this.createBitItem(i);
                i.index = index;
                i.already_parsed = true;
            });
        }
    }

    applyBasicCSS() {
    }

    get_i18n_dict() {
        return this.i18n_dict[this.language];
    }

    init() {
        this.on('onChange', data => {
            this.log(`some change on instance: ${this.id}`, data);
            this.log(...this.getFiles(1));
        });
        this.applyBasicCSS();
        this.element.setAttribute('id', this.id);
        this.element.insertAdjacentHTML('beforeend', `<div>${this.i18n.DRAG_AND_DROP_TEXT}</div>`);
        this.setupHiddenInput();
        this.element.addEventListener('drop', this.onDrop.bind(this), false);
        this.element.addEventListener('dragover', this.onDragOver, false);
        
        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer.types.includes('text/plain')) {
                e.dataTransfer.dropEffect = 'move';
            } else {
                e.dataTransfer.dropEffect = 'copy';
            }
        });
    }

    async onFileSelect(e) {
        if (this.files.length + e.target.files.length > this.maxFiles) {
            console.error('Maximum file limit reached.');
            return;
        }
        this.files = this.files.concat(Array.from(e.target.files));
        setTimeout(this.buildPreviews, 0);
    }

    buildPreviews = () => {
        let promises = [];
        const files = this.files.filter(i => !i.src);

        for (let file of files) {
            promises.push(
                new Promise((resolve) => {
                    let fr = new FileReader();
                    fr.onload = async function () {
                        let res = await fetch(fr.result);
                        res = await res.blob();
                        if (!file.hasOwnProperty('uploaded')) {
                            file.uploaded = false;
                        }
                        file.src = URL.createObjectURL(res);
                        resolve(file);
                    };
                    fr.readAsDataURL(file);
                })
            );
        }

        Promise.all(promises).then(files => {
            files.forEach(file => this.show_images(file));
            this.emit('reading_finish');
        });
    }

    onDragOver(ev) {
        ev.preventDefault();
    }

    onDrop(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            [...ev.dataTransfer.items].forEach(item => {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    this.files.push(file);
                }
            });
        } else {
            [...ev.dataTransfer.files].forEach(file => {
                this.files.push(file);
            });
        }
        this.buildPreviews();
    }

    async getThumbnail(file) {
        return new Promise((resolve) => {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                file.dataURL = fileReader.result;
                resolve({ 'dataUrl': fileReader.result });
            };
            fileReader.readAsDataURL(file);
        });
    }

    setupHiddenInput() {
        const elem = document.querySelector(this.DOM_IDS.HIDDEN_INPUT);
        if (elem) elem.remove();
        let i = document.createElement('input');
        i.type = "file";
        i.multiple = true;
        i.accept = 'image/*';
        i.style = 'visibility: hidden; position: absolute; top: 0px; left: 0px; height: 0px; width: 0px;';
        i.id = this.DOM_IDS.HIDDEN_INPUT.replace('#', '');
        i.onchange = (e) => this.onFileSelect(e);
        document.body.appendChild(i);

        this.element.addEventListener('click', () => i.click());
    }

    updateWithToken(token = "", obj = {}) {
        let update_count = 0;
        this.files.forEach(f => {
            if (token && f.token == token) {
                if (!f.additional_data) f.additional_data = {};
                Object.assign(f.additional_data, obj);
                update_count += 1;
            }
        });
        return update_count;
    }

    update(token = "", index = null, obj = {}) {
        let update_count = 0;
        this.files.forEach((f, i) => {
            if ((token && f.token == token) || (typeof index == "number" && i == index)) {
                if (!f.additional_data) f.additional_data = {};
                Object.assign(f.additional_data, obj);
                update_count += 1;
            }
        });
        return update_count;
    }

    getFiles(form_data = false, raise_error = false, uploaded = false) {
        let files = this.files.filter(i => i.uploaded === uploaded);
        if (!form_data) return files;
        if (!files.length && raise_error) throw new Error('no files');
        var fd = new FormData();
        let image_data = [];
        for (let file of files) {
            if (!(file instanceof File)) {
                this.log('no file detected, skipping');
                continue;
            }
            image_data.push({
                key: file.token,
                ...file.additional_data
            });
            fd.append(file.token, file);
        }
        fd.append('image_data', JSON.stringify(image_data));
        return fd;
    }

    upload() {
        if (!this.upload_url) {
            throw new Error('No upload url setted, create the instance with upload_url setted');
        }
        this.rebuildIndexes();
        let files = this.getFiles(true, true, false);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', this.upload_url);
        for (const key in this.headers) {
            xhr.setRequestHeader(key, this.headers[key]);
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    let files = this.getFiles(false, false, false);
                    for (let file of files) {
                        file.uploaded = true;
                    }
                }
            }
        };
        xhr.send(files);
    }

    async addFiles(data) {
        let t = this;
        for (let i = 0; i < data.length; i++) {
            await fetch(data[i].src)
                .then(response => response.blob())
                .then(blob => {
                    var type = blob.type || t.fallBackAddedFileBlobType;
                    const extension = type.split('/')[1] || 'png';
                    blob.name = `name${t.get_random_key()}.${extension}`;
                    const f = new File([blob], blob.name, { type: type });
                    delete data[i]['src'];
                    f.uploaded = data[i].uploaded;
                    delete data[i]['uploaded'];
                    f.additional_data = { ...data[i] };
                    t.files.push(f);
                });
        }
        this.buildPreviews();
    }
}

if (typeof module == "object") {
    module.exports = Bit;
}
