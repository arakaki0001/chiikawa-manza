// ちいかわ在庫管理システム - メインスクリプト

document.addEventListener('DOMContentLoaded', () => {
    // グローバル変数
    let filteredData = [...inventoryData];
    let currentSort = { column: 'id', direction: 'asc' };
    let activeCategory = 'all';
    let showLowStockOnly = false;

    // 入荷履歴を取得
    let stockHistory = JSON.parse(localStorage.getItem('chiikawa_stock_history') || '[]');

    // DOM要素
    const searchInput = document.getElementById('searchInput');
    const categoryFilters = document.getElementById('categoryFilters');
    const lowStockToggle = document.getElementById('lowStockToggle');
    const tableBody = document.getElementById('tableBody');
    const resultCount = document.getElementById('resultCount');

    // 統計カード要素
    const totalProducts = document.getElementById('totalProducts');
    const totalValue = document.getElementById('totalValue');
    const lowStockCount = document.getElementById('lowStockCount');
    const categoryCount = document.getElementById('categoryCount');

    // 初期化
    init();

    function init() {
        loadStockFromStorage();
        renderCategoryFilters();
        updateStats();
        renderTable();
        setupEventListeners();
        createModal();
    }

    // ローカルストレージから在庫を適用
    function loadStockFromStorage() {
        const storedStock = localStorage.getItem('chiikawa_current_stock');
        if (storedStock) {
            const stockData = JSON.parse(storedStock);
            inventoryData.forEach(item => {
                if (stockData[item.jan] !== undefined) {
                    item.stock = stockData[item.jan];
                }
            });
        }
    }

    // 在庫をローカルストレージに保存
    function saveStockToStorage() {
        const stockData = {};
        inventoryData.forEach(item => {
            stockData[item.jan] = item.stock;
        });
        localStorage.setItem('chiikawa_current_stock', JSON.stringify(stockData));
    }

    // カテゴリフィルターボタンを生成
    function renderCategoryFilters() {
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.textContent = 'すべて';
        allBtn.dataset.category = 'all';
        categoryFilters.appendChild(allBtn);

        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = category;
            btn.dataset.category = category;
            categoryFilters.appendChild(btn);
        });
    }

    // 統計を更新
    function updateStats() {
        // 総商品数
        totalProducts.textContent = inventoryData.length.toLocaleString();

        // 総在庫金額（仕入れ税込ベース）
        const total = inventoryData.reduce((sum, item) => sum + (item.costInTax * item.stock), 0);
        totalValue.textContent = '¥' + total.toLocaleString();

        // 低在庫商品数（10個以下）
        const lowStock = inventoryData.filter(item => item.stock <= 10).length;
        lowStockCount.textContent = lowStock;

        // カテゴリ数
        categoryCount.textContent = categories.length;
    }

    // テーブルを描画
    function renderTable() {
        // フィルタリング
        filteredData = inventoryData.filter(item => {
            // 検索フィルター
            const searchTerm = searchInput.value.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                item.jan.includes(searchTerm);

            // カテゴリフィルター
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;

            // 低在庫フィルター
            const matchesLowStock = !showLowStockOnly || item.stock <= 10;

            return matchesSearch && matchesCategory && matchesLowStock;
        });

        // ソート
        filteredData.sort((a, b) => {
            let aVal = a[currentSort.column];
            let bVal = b[currentSort.column];

            // 文字列の場合
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        // 結果数を更新
        resultCount.textContent = `${filteredData.length}件を表示`;

        // テーブルボディをクリアして再描画
        tableBody.innerHTML = '';

        if (filteredData.length === 0) {
            tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <div class="icon">🔍</div>
            <p>該当する商品が見つかりませんでした</p>
          </td>
        </tr>
      `;
            return;
        }

        filteredData.forEach(item => {
            const row = document.createElement('tr');

            // 低在庫フラグ
            if (item.stock <= 10) {
                row.classList.add('low-stock');
            }

            // 在庫レベルクラス
            let stockClass = 'good';
            if (item.stock <= 10) stockClass = 'low';
            else if (item.stock <= 30) stockClass = 'warning';

            row.innerHTML = `
        <td>${item.id}</td>
        <td>
          <div class="product-name">
            <span class="name">${escapeHtml(item.name)}</span>
            <span class="jan">${item.jan}</span>
          </div>
        </td>
        <td><span class="category-badge ${item.category}">${item.category}</span></td>
        <td class="stock-cell ${stockClass}">${item.stock.toLocaleString()}</td>
        <td class="price-cell">¥${item.costInTax.toLocaleString()}</td>
        <td class="price-cell">¥${item.priceInTax.toLocaleString()}</td>
        <td class="price-cell">¥${(item.costInTax * item.stock).toLocaleString()}</td>
        <td class="action-cell">
          <button class="add-stock-btn" data-jan="${item.jan}" title="在庫追加">＋入荷</button>
          <button class="remove-stock-btn" data-jan="${item.jan}" title="在庫減少">−出荷</button>
        </td>
      `;

            tableBody.appendChild(row);
        });

        // 在庫追加ボタンのイベント
        document.querySelectorAll('.add-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jan = e.target.dataset.jan;
                openAddStockModal(jan);
            });
        });

        // 在庫減少ボタンのイベント
        document.querySelectorAll('.remove-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jan = e.target.dataset.jan;
                openRemoveStockModal(jan);
            });
        });
    }

    // モーダルを作成
    function createModal() {
        const modalHtml = `
        <div id="stockModal" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">在庫追加</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="modalProductInfo"></div>
                    <div class="form-group">
                        <label>追加数量</label>
                        <input type="number" id="addQuantity" min="1" value="1" class="modal-input">
                    </div>
                    <div class="form-group">
                        <label>メモ（任意）</label>
                        <input type="text" id="addMemo" placeholder="例：○○からの入荷" class="modal-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn secondary" onclick="closeModal()">キャンセル</button>
                    <button class="modal-btn primary" id="confirmAddStock">追加する</button>
                </div>
            </div>
        </div>
        
        <div id="historyModal" class="modal-overlay" style="display:none;">
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h3>📋 入出荷履歴</h3>
                    <button class="modal-close" onclick="closeHistoryModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="historyList"></div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn secondary" onclick="closeHistoryModal()">閉じる</button>
                    <button class="modal-btn danger" onclick="clearHistory()">履歴をクリア</button>
                </div>
            </div>
        </div>

        <div id="removeStockModal" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📦 在庫減少（出荷）</h3>
                    <button class="modal-close" onclick="closeRemoveModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="removeModalProductInfo"></div>
                    <div class="form-group">
                        <label>減少数量</label>
                        <input type="number" id="removeQuantity" min="1" value="1" class="modal-input">
                    </div>
                    <div class="form-group">
                        <label>理由（任意）</label>
                        <select id="removeReason" class="modal-input">
                            <option value="販売">販売</option>
                            <option value="返品">返品（仕入先へ）</option>
                            <option value="破損">破損・廃棄</option>
                            <option value="サンプル">サンプル・贈答</option>
                            <option value="棚卸調整">棚卸調整</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>メモ（任意）</label>
                        <input type="text" id="removeMemo" placeholder="例：○○様へ出荷" class="modal-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn secondary" onclick="closeRemoveModal()">キャンセル</button>
                    <button class="modal-btn danger" id="confirmRemoveStock">減少する</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // モーダルスタイルを追加
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 16px;
                padding: 0;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                animation: modalSlideIn 0.3s ease;
            }
            .modal-wide {
                max-width: 600px;
            }
            @keyframes modalSlideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid #eee;
            }
            .modal-header h3 {
                margin: 0;
                font-size: 1.2rem;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #888;
                padding: 0;
                line-height: 1;
            }
            .modal-close:hover {
                color: #333;
            }
            .modal-body {
                padding: 1.5rem;
            }
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
                padding: 1rem 1.5rem;
                border-top: 1px solid #eee;
                background: #f8f8f8;
                border-radius: 0 0 16px 16px;
            }
            .form-group {
                margin-bottom: 1rem;
            }
            .form-group label {
                display: block;
                font-size: 0.9rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #555;
            }
            .modal-input {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 1rem;
                box-sizing: border-box;
            }
            .modal-input:focus {
                outline: none;
                border-color: var(--primary);
            }
            .modal-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 50px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .modal-btn.primary {
                background: var(--primary);
                color: white;
            }
            .modal-btn.primary:hover {
                background: var(--primary-dark);
            }
            .modal-btn.secondary {
                background: #e0e0e0;
                color: #333;
            }
            .modal-btn.secondary:hover {
                background: #d0d0d0;
            }
            .modal-btn.danger {
                background: var(--danger);
                color: white;
            }
            .modal-btn.danger:hover {
                background: #e05555;
            }
            .product-info {
                background: var(--primary-light);
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
            .product-info .name {
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 0.25rem;
            }
            .product-info .current {
                font-size: 0.9rem;
                color: #666;
            }
            .add-stock-btn {
                padding: 0.4rem 0.8rem;
                background: var(--accent);
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            .add-stock-btn:hover {
                background: #7BC98F;
                transform: scale(1.05);
            }
            .remove-stock-btn {
                padding: 0.4rem 0.8rem;
                background: #888;
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
                margin-left: 0.25rem;
            }
            .remove-stock-btn:hover {
                background: var(--danger);
                transform: scale(1.05);
            }
            .action-cell {
                text-align: center;
                white-space: nowrap;
            }
            .history-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid #eee;
            }
            .history-item:last-child {
                border-bottom: none;
            }
            .history-item .info {
                flex: 1;
            }
            .history-item .product {
                font-weight: 500;
            }
            .history-item .meta {
                font-size: 0.85rem;
                color: #888;
            }
            .history-item .quantity {
                font-weight: 700;
                font-size: 1.1rem;
            }
            .history-item .quantity-add {
                color: var(--accent);
            }
            .history-item .quantity-remove {
                color: var(--danger);
            }
            .history-empty {
                text-align: center;
                padding: 2rem;
                color: #888;
            }
            .history-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: var(--bg-card);
                border: 2px solid var(--primary-light);
                border-radius: 50px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .history-btn:hover {
                background: var(--primary-light);
            }
        `;
        document.head.appendChild(style);
    }

    // 在庫追加モーダルを開く
    window.openAddStockModal = function (jan) {
        const item = inventoryData.find(i => i.jan === jan);
        if (!item) return;

        document.getElementById('modalProductInfo').innerHTML = `
            <div class="product-info">
                <div class="name">${escapeHtml(item.name)}</div>
                <div class="current">現在の在庫: ${item.stock}個</div>
            </div>
        `;
        document.getElementById('addQuantity').value = 1;
        document.getElementById('addMemo').value = '';
        document.getElementById('stockModal').style.display = 'flex';

        // 確定ボタン
        document.getElementById('confirmAddStock').onclick = () => {
            const quantity = parseInt(document.getElementById('addQuantity').value) || 0;
            const memo = document.getElementById('addMemo').value.trim();

            if (quantity > 0) {
                addStock(jan, quantity, memo);
                closeModal();
            }
        };
    };

    // モーダルを閉じる
    window.closeModal = function () {
        document.getElementById('stockModal').style.display = 'none';
    };

    // 在庫を追加
    function addStock(jan, quantity, memo) {
        const item = inventoryData.find(i => i.jan === jan);
        if (!item) return;

        const oldStock = item.stock;
        item.stock += quantity;

        // 履歴に追加
        const historyEntry = {
            date: new Date().toISOString(),
            jan: jan,
            name: item.name,
            quantity: quantity,
            oldStock: oldStock,
            newStock: item.stock,
            memo: memo
        };
        stockHistory.unshift(historyEntry);

        // ローカルストレージに保存
        localStorage.setItem('chiikawa_stock_history', JSON.stringify(stockHistory));
        saveStockToStorage();

        // 画面を更新
        updateStats();
        renderTable();
    }

    // 履歴モーダルを開く
    window.openHistoryModal = function () {
        const list = document.getElementById('historyList');

        if (stockHistory.length === 0) {
            list.innerHTML = '<div class="history-empty">📦 入出荷履歴がありません</div>';
        } else {
            list.innerHTML = stockHistory.slice(0, 50).map(h => {
                const date = new Date(h.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                const isAdd = h.type !== 'remove';
                const quantityClass = isAdd ? 'quantity-add' : 'quantity-remove';
                const quantityText = isAdd ? `+${h.quantity}` : `−${h.quantity}`;
                const reasonText = h.reason ? ` [${h.reason}]` : '';
                return `
                    <div class="history-item">
                        <div class="info">
                            <div class="product">${escapeHtml(h.name)}</div>
                            <div class="meta">${dateStr}${reasonText}${h.memo ? ' | ' + escapeHtml(h.memo) : ''}</div>
                        </div>
                        <div class="quantity ${quantityClass}">${quantityText}</div>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('historyModal').style.display = 'flex';
    };

    // 履歴モーダルを閉じる
    window.closeHistoryModal = function () {
        document.getElementById('historyModal').style.display = 'none';
    };

    // 履歴をクリア
    window.clearHistory = function () {
        if (confirm('入出荷履歴をすべて削除しますか？')) {
            stockHistory = [];
            localStorage.removeItem('chiikawa_stock_history');
            closeHistoryModal();
        }
    };

    // 出荷モーダルを開く
    window.openRemoveStockModal = function (jan) {
        const item = inventoryData.find(i => i.jan === jan);
        if (!item) return;

        document.getElementById('removeModalProductInfo').innerHTML = `
            <div class="product-info">
                <div class="name">${escapeHtml(item.name)}</div>
                <div class="current">現在の在庫: ${item.stock}個</div>
            </div>
        `;
        document.getElementById('removeQuantity').value = 1;
        document.getElementById('removeQuantity').max = item.stock;
        document.getElementById('removeReason').value = '販売';
        document.getElementById('removeMemo').value = '';
        document.getElementById('removeStockModal').style.display = 'flex';

        // 確定ボタン
        document.getElementById('confirmRemoveStock').onclick = () => {
            const quantity = parseInt(document.getElementById('removeQuantity').value) || 0;
            const reason = document.getElementById('removeReason').value;
            const memo = document.getElementById('removeMemo').value.trim();

            if (quantity > 0 && quantity <= item.stock) {
                removeStock(jan, quantity, reason, memo);
                closeRemoveModal();
            } else if (quantity > item.stock) {
                alert('在庫数を超えて減らすことはできません');
            }
        };
    };

    // 出荷モーダルを閉じる
    window.closeRemoveModal = function () {
        document.getElementById('removeStockModal').style.display = 'none';
    };

    // 在庫を減らす
    function removeStock(jan, quantity, reason, memo) {
        const item = inventoryData.find(i => i.jan === jan);
        if (!item) return;

        const oldStock = item.stock;
        item.stock -= quantity;

        // 履歴に追加
        const historyEntry = {
            date: new Date().toISOString(),
            type: 'remove',
            jan: jan,
            name: item.name,
            quantity: quantity,
            reason: reason,
            oldStock: oldStock,
            newStock: item.stock,
            memo: memo
        };
        stockHistory.unshift(historyEntry);

        // ローカルストレージに保存
        localStorage.setItem('chiikawa_stock_history', JSON.stringify(stockHistory));
        saveStockToStorage();

        // 画面を更新
        updateStats();
        renderTable();
    }

    // イベントリスナーを設定
    function setupEventListeners() {
        // 検索
        searchInput.addEventListener('input', debounce(() => {
            renderTable();
        }, 300));

        // カテゴリフィルター
        categoryFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                activeCategory = e.target.dataset.category;
                renderTable();
            }
        });

        // 低在庫トグル
        lowStockToggle.addEventListener('change', () => {
            showLowStockOnly = lowStockToggle.checked;
            renderTable();
        });

        // ソート
        document.querySelectorAll('.inventory-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;

                // 同じカラムをクリックした場合は方向を反転
                if (currentSort.column === column) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.column = column;
                    currentSort.direction = 'asc';
                }

                // ソートアイコンを更新
                document.querySelectorAll('.inventory-table th').forEach(header => {
                    header.classList.remove('sorted');
                    const icon = header.querySelector('.sort-icon');
                    if (icon) icon.textContent = '↕';
                });

                th.classList.add('sorted');
                const sortIcon = th.querySelector('.sort-icon');
                if (sortIcon) {
                    sortIcon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
                }

                renderTable();
            });
        });

        // モーダル外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });
    }

    // ユーティリティ関数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
