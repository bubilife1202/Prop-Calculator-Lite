// ========== 전역 변수 ==========
let selectedResidenceTypes = [];
let chartInstances = {
    comparison: null,
    individual: null,
    breakdown: null
};
let calculationResults = null;

// ========== 프리셋 데이터 ==========
const presets = {
    gangnam: {
        name: '서울 강남 신혼부부',
        residenceTypes: ['buy', 'jeonse'],
        salePrice: 8,
        depositPrice: 5,
        monthlyDeposit: 1,
        monthlyRent: 150,
        loanRate: 4.5,
        acquisitionTax: 4.5,
        propertyTax: 150,
        appreciationRate: 3,
        investmentReturn: 8,
        holdingPeriod: 10
    },
    pangyo: {
        name: '경기 판교 IT직장인',
        residenceTypes: ['buy', 'monthly'],
        salePrice: 10,
        depositPrice: 3,
        monthlyDeposit: 2,
        monthlyRent: 200,
        loanRate: 4.3,
        acquisitionTax: 4.5,
        propertyTax: 200,
        appreciationRate: 2.5,
        investmentReturn: 10,
        holdingPeriod: 7
    },
    busan: {
        name: '부산 해운대 은퇴준비',
        residenceTypes: ['buy', 'jeonse'],
        salePrice: 5,
        depositPrice: 3,
        monthlyDeposit: 1,
        monthlyRent: 100,
        loanRate: 4,
        acquisitionTax: 4.5,
        propertyTax: 80,
        appreciationRate: 2,
        investmentReturn: 7,
        holdingPeriod: 15
    },
    local: {
        name: '지방 소도시 실수요',
        residenceTypes: ['buy', 'jeonse'],
        salePrice: 3,
        depositPrice: 1.5,
        monthlyDeposit: 0.5,
        monthlyRent: 60,
        loanRate: 3.8,
        acquisitionTax: 4.5,
        propertyTax: 50,
        appreciationRate: 1,
        investmentReturn: 6,
        holdingPeriod: 20
    }
};

// ========== DOMContentLoaded - 모든 초기화 여기서 ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 페이지 로드 완료');

    // DOM 요소 가져오기
    const step1Screen = document.getElementById('step1Screen');
    const step2Screen = document.getElementById('step2Screen');
    const step3Screen = document.getElementById('step3Screen');
    const loadingScreen = document.getElementById('loadingScreen');
    const resultScreen = document.getElementById('resultScreen');

    // ========== 슬라이더 초기화 (가장 단순한 방식) ==========
    function initSlider(sliderId, inputId) {
        const slider = document.getElementById(sliderId);
        const input = document.getElementById(inputId);

        if (!slider || !input) return;

        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
        });

        input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                slider.value = Math.min(Math.max(val, parseFloat(slider.min)), parseFloat(slider.max));
            }
        });

        slider.value = input.value;
        console.log(`✅ ${sliderId} 초기화`);
    }

    // 모든 슬라이더 초기화
    initSlider('salePriceSlider', 'salePrice');
    initSlider('depositPriceSlider', 'depositPrice');
    initSlider('monthlyDepositSlider', 'monthlyDeposit');
    initSlider('monthlyRentSlider', 'monthlyRent');
    initSlider('loanRateSlider', 'loanRate');
    initSlider('appreciationRateSlider', 'appreciationRate');
    initSlider('investmentReturnSlider', 'investmentReturn');
    initSlider('holdingPeriodSlider', 'holdingPeriod');

    // ========== 프리셋 버튼 ==========
    const presetBtns = document.querySelectorAll('.preset-btn');
    console.log(`🔍 프리셋 버튼: ${presetBtns.length}개`);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const key = btn.getAttribute('data-preset');
            const preset = presets[key];

            console.log(`🎯 프리셋 클릭: ${preset.name}`);

            // 체크박스 설정
            document.querySelectorAll('input[name="residence"]').forEach(cb => {
                cb.checked = preset.residenceTypes.includes(cb.value);
            });

            // 입력값 설정
            document.getElementById('salePrice').value = preset.salePrice;
            document.getElementById('depositPrice').value = preset.depositPrice;
            document.getElementById('monthlyDeposit').value = preset.monthlyDeposit;
            document.getElementById('monthlyRent').value = preset.monthlyRent;
            document.getElementById('loanRate').value = preset.loanRate;
            document.getElementById('acquisitionTax').value = preset.acquisitionTax;
            document.getElementById('propertyTax').value = preset.propertyTax;
            document.getElementById('appreciationRate').value = preset.appreciationRate;
            document.getElementById('investmentReturn').value = preset.investmentReturn;
            document.getElementById('holdingPeriod').value = preset.holdingPeriod;

            // 슬라이더 동기화
            document.getElementById('salePriceSlider').value = preset.salePrice;
            document.getElementById('depositPriceSlider').value = preset.depositPrice;
            document.getElementById('monthlyDepositSlider').value = preset.monthlyDeposit;
            document.getElementById('monthlyRentSlider').value = preset.monthlyRent;
            document.getElementById('loanRateSlider').value = preset.loanRate;
            document.getElementById('appreciationRateSlider').value = preset.appreciationRate;
            document.getElementById('investmentReturnSlider').value = preset.investmentReturn;
            document.getElementById('holdingPeriodSlider').value = preset.holdingPeriod;

            // 다음 버튼 활성화 후 클릭
            const nextBtn = document.getElementById('step1NextBtn');
            nextBtn.disabled = false;

            setTimeout(() => {
                nextBtn.click();
            }, 100);
        });
    });

    // ========== 체크박스 변경 감지 ==========
    document.querySelectorAll('input[name="residence"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('input[name="residence"]:checked');
            document.getElementById('step1NextBtn').disabled = checked.length < 2;
        });
    });

    // ========== Step 1 -> Step 2 ==========
    document.getElementById('step1NextBtn').addEventListener('click', () => {
        selectedResidenceTypes = Array.from(document.querySelectorAll('input[name="residence"]:checked'))
            .map(cb => cb.value);

        document.getElementById('buyInputs').style.display =
            selectedResidenceTypes.includes('buy') ? 'block' : 'none';
        document.getElementById('jeonseInputs').style.display =
            selectedResidenceTypes.includes('jeonse') ? 'block' : 'none';
        document.getElementById('monthlyInputs').style.display =
            selectedResidenceTypes.includes('monthly') ? 'block' : 'none';

        switchScreen(step1Screen, step2Screen);
    });

    // ========== Step 2 버튼들 ==========
    document.getElementById('step2BackBtn').addEventListener('click', () => {
        switchScreen(step2Screen, step1Screen);
    });

    document.getElementById('step2NextBtn').addEventListener('click', () => {
        switchScreen(step2Screen, step3Screen);
    });

    document.getElementById('skipAdvancedBtn').addEventListener('click', () => {
        const inputs = getInputValues();
        const errors = validateInputs(inputs, selectedResidenceTypes);

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        switchScreen(step2Screen, loadingScreen);
        setTimeout(() => {
            performCalculation(inputs, selectedResidenceTypes);
            switchScreen(loadingScreen, resultScreen);
        }, 1500);
    });

    // ========== Step 3 버튼들 ==========
    document.getElementById('step3BackBtn').addEventListener('click', () => {
        switchScreen(step3Screen, step2Screen);
    });

    document.getElementById('calculateBtn').addEventListener('click', () => {
        const inputs = getInputValues();
        const errors = validateInputs(inputs, selectedResidenceTypes);

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        switchScreen(step3Screen, loadingScreen);
        setTimeout(() => {
            performCalculation(inputs, selectedResidenceTypes);
            switchScreen(loadingScreen, resultScreen);
        }, 1500);
    });

    // ========== 차트 탭 ==========
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const chartType = tab.getAttribute('data-chart');
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.chart-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`chart${chartType.charAt(0).toUpperCase() + chartType.slice(1)}`).classList.add('active');
        });
    });

    // ========== 결과 화면 버튼들 ==========
    document.getElementById('backBtn').addEventListener('click', () => {
        switchScreen(resultScreen, step1Screen);
    });

    document.getElementById('shareBtn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: '집, 살까 말까? 계산 결과',
                text: '내 부동산 투자 시뮬레이션 결과를 확인해보세요!',
                url: window.location.href
            }).catch(err => console.log('공유 실패:', err));
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('링크가 복사되었습니다!');
            });
        }
    });

    document.getElementById('saveImageBtn').addEventListener('click', () => {
        const resultContainer = document.querySelector('#resultScreen .container');
        const saveBtn = document.getElementById('saveImageBtn');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span>📸</span> 저장 중...';
        saveBtn.disabled = true;

        html2canvas(resultContainer, {
            backgroundColor: '#F9FAFB',
            scale: 2
        }).then(canvas => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `부동산_계산_${new Date().toISOString().split('T')[0]}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                saveBtn.innerHTML = originalHTML;
                saveBtn.disabled = false;
            });
        });
    });

    // ========== 모달 ==========
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeModal = document.getElementById('closeModal');
    const startBtn = document.getElementById('startBtn');

    infoBtn.addEventListener('click', () => infoModal.classList.add('active'));
    closeModal.addEventListener('click', () => infoModal.classList.remove('active'));
    startBtn.addEventListener('click', () => infoModal.classList.remove('active'));
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) infoModal.classList.remove('active');
    });

    console.log('✅ 모든 초기화 완료');
});

// ========== 화면 전환 ==========
function switchScreen(from, to) {
    from.classList.remove('active');
    setTimeout(() => {
        to.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
}

// ========== 입력값 가져오기 ==========
function getInputValues() {
    return {
        salePrice: parseFloat(document.getElementById('salePrice').value) || 0,
        depositPrice: parseFloat(document.getElementById('depositPrice').value) || 0,
        monthlyDeposit: parseFloat(document.getElementById('monthlyDeposit').value) || 0,
        monthlyRent: parseFloat(document.getElementById('monthlyRent').value) / 10000 || 0,
        loanRate: parseFloat(document.getElementById('loanRate').value) / 100,
        acquisitionTax: parseFloat(document.getElementById('acquisitionTax').value) / 100,
        propertyTax: parseFloat(document.getElementById('propertyTax').value) / 10000,
        appreciationRate: parseFloat(document.getElementById('appreciationRate').value) / 100,
        investmentReturn: parseFloat(document.getElementById('investmentReturn').value) / 100,
        holdingPeriod: parseInt(document.getElementById('holdingPeriod').value)
    };
}

// ========== 검증 ==========
function validateInputs(inputs, selectedTypes) {
    const errors = [];
    if (selectedTypes.includes('buy') && inputs.salePrice <= 0) errors.push('매매가를 입력해주세요.');
    if (selectedTypes.includes('jeonse') && inputs.depositPrice <= 0) errors.push('전세 보증금을 입력해주세요.');
    if (selectedTypes.includes('monthly') && inputs.monthlyRent <= 0) errors.push('월세 임대료를 입력해주세요.');
    return errors;
}

// ========== 매수 계산 ==========
function calculateBuyScenario(inputs) {
    const { salePrice, loanRate, acquisitionTax, propertyTax, appreciationRate, holdingPeriod } = inputs;
    const acquisitionCost = salePrice * acquisitionTax;
    const loanAmount = salePrice * 0.7;
    let yearlyData = [];
    let cumulativeCosts = acquisitionCost;

    for (let year = 0; year <= holdingPeriod; year++) {
        const currentHouseValue = salePrice * Math.pow(1 + appreciationRate, year);
        if (year > 0) {
            cumulativeCosts += loanAmount * loanRate + propertyTax;
        }
        yearlyData.push({
            year,
            asset: currentHouseValue - loanAmount - cumulativeCosts,
            houseValue: currentHouseValue,
            debt: loanAmount,
            costs: cumulativeCosts
        });
    }
    return yearlyData;
}

// ========== 전세 계산 ==========
function calculateJeonseScenario(inputs) {
    const { salePrice, depositPrice, investmentReturn, holdingPeriod } = inputs;
    const investableAmount = salePrice - depositPrice;
    let yearlyData = [];

    for (let year = 0; year <= holdingPeriod; year++) {
        const investmentValue = investableAmount * Math.pow(1 + investmentReturn, year);
        yearlyData.push({
            year,
            asset: investmentValue + depositPrice,
            investment: investmentValue,
            deposit: depositPrice
        });
    }
    return yearlyData;
}

// ========== 월세 계산 ==========
function calculateMonthlyRentScenario(inputs) {
    const { salePrice, monthlyDeposit, monthlyRent, investmentReturn, holdingPeriod } = inputs;
    const investableAmount = salePrice - monthlyDeposit;
    let yearlyData = [];

    for (let year = 0; year <= holdingPeriod; year++) {
        const investmentValue = investableAmount * Math.pow(1 + investmentReturn, year);
        const cumulativeRent = monthlyRent * 12 * year;
        yearlyData.push({
            year,
            asset: investmentValue + monthlyDeposit - cumulativeRent,
            investment: investmentValue,
            deposit: monthlyDeposit,
            rentPaid: cumulativeRent
        });
    }
    return yearlyData;
}

// ========== 계산 실행 ==========
function performCalculation(inputs, selectedTypes) {
    const results = {};
    if (selectedTypes.includes('buy')) results.buy = calculateBuyScenario(inputs);
    if (selectedTypes.includes('jeonse')) results.jeonse = calculateJeonseScenario(inputs);
    if (selectedTypes.includes('monthly')) results.monthly = calculateMonthlyRentScenario(inputs);

    calculationResults = { inputs, selectedTypes, results };
    renderResults();
}

// ========== 결과 렌더링 ==========
function renderResults() {
    const { inputs, selectedTypes, results } = calculationResults;
    const finalAssets = {};
    if (results.buy) finalAssets.buy = results.buy[results.buy.length - 1].asset;
    if (results.jeonse) finalAssets.jeonse = results.jeonse[results.jeonse.length - 1].asset;
    if (results.monthly) finalAssets.monthly = results.monthly[results.monthly.length - 1].asset;

    const bestOption = Object.keys(finalAssets).reduce((a, b) => finalAssets[a] > finalAssets[b] ? a : b);
    const optionNames = { buy: '매수', jeonse: '전세', monthly: '월세' };

    renderVerdict(bestOption, finalAssets, optionNames, inputs.holdingPeriod);
    renderComparisonChart();
    renderIndividualChart();
    renderBreakdownChart();
    renderDetailedAnalysis();
    saveToHistory(bestOption, finalAssets, optionNames, inputs);
    loadHistory();
}

// ========== 판정 렌더링 ==========
function renderVerdict(bestOption, finalAssets, optionNames, holdingPeriod) {
    const verdictContent = document.getElementById('verdictContent');
    const bestValue = finalAssets[bestOption];
    let comparisonHTML = '';

    Object.keys(finalAssets).forEach(option => {
        const diff = finalAssets[option] - bestValue;
        const diffText = diff === 0 ? '최고 수익' : `${Math.abs(diff).toFixed(2)}억 차이`;
        const icon = option === bestOption ? '🏆' : diff >= -0.1 ? '⚖️' : '📉';

        comparisonHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: ${option === bestOption ? '#EEF2FF' : '#F9FAFB'}; border-radius: 12px; margin-bottom: 10px; border: 2px solid ${option === bestOption ? '#6366F1' : '#E5E7EB'};">
                <div>
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <strong style="font-size: 1.2rem; margin-left: 10px;">${optionNames[option]}</strong>
                </div>
                <div style="text-align: right;">
                    <div class="count-up" style="font-size: 1.3rem; font-weight: 700; color: ${option === bestOption ? '#6366F1' : '#6B7280'};" data-target="${finalAssets[option].toFixed(2)}">0.00억</div>
                    <div style="font-size: 0.9rem; color: #9CA3AF;">${diffText}</div>
                </div>
            </div>
        `;
    });

    verdictContent.innerHTML = `
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #1F2937; margin-bottom: 20px;">
            🎯 ${holdingPeriod}년 후 최적의 선택: <span style="color: #6366F1;">${optionNames[bestOption]}</span>
        </h2>
        <p style="font-size: 1.1rem; color: #6B7280; margin-bottom: 30px; line-height: 1.8;">
            ${holdingPeriod}년 동안 보유할 경우, <strong>${optionNames[bestOption]}</strong>가 가장 유리한 선택입니다.
        </p>
        ${comparisonHTML}
    `;

    setTimeout(() => animateCountUp(), 300);
}

// ========== 카운트업 애니메이션 ==========
function animateCountUp() {
    document.querySelectorAll('.count-up').forEach(el => {
        const target = parseFloat(el.getAttribute('data-target'));
        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = easeProgress * target;
            el.textContent = current.toFixed(2) + '억';
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target.toFixed(2) + '억';
        }
        requestAnimationFrame(update);
    });
}

// ========== 차트 렌더링 (기존 코드 유지) ==========
function renderComparisonChart() {
    const { results } = calculationResults;
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (chartInstances.comparison) chartInstances.comparison.destroy();

    const datasets = [];
    const colors = {
        buy: { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' },
        jeonse: { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' },
        monthly: { border: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)' }
    };
    const labels = { buy: '🏠 매수', jeonse: '🔑 전세', monthly: '📅 월세' };

    Object.keys(results).forEach(type => {
        datasets.push({
            label: labels[type],
            data: results[type].map(d => d.asset),
            borderColor: colors[type].border,
            backgroundColor: colors[type].bg,
            borderWidth: 3,
            tension: 0.4,
            fill: true
        });
    });

    chartInstances.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: results[Object.keys(results)[0]].map(d => `${d.year}년`),
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: '자산 변화 추이 비교', font: { size: 20 } },
                legend: { position: 'top' }
            },
            scales: {
                y: { ticks: { callback: v => v.toFixed(1) + '억' } }
            }
        }
    });
}

function renderIndividualChart() {
    const { results } = calculationResults;
    const ctx = document.getElementById('individualChart').getContext('2d');
    if (chartInstances.individual) chartInstances.individual.destroy();

    const datasets = [];
    const colors = { buy: 'rgb(239, 68, 68)', jeonse: 'rgb(59, 130, 246)', monthly: 'rgb(16, 185, 129)' };
    const labels = { buy: '🏠 매수', jeonse: '🔑 전세', monthly: '📅 월세' };

    Object.keys(results).forEach(type => {
        const growthRates = results[type].map((d, i) => {
            if (i === 0) return 0;
            const prev = results[type][i - 1].asset;
            return prev === 0 ? 0 : ((d.asset - prev) / Math.abs(prev)) * 100;
        });
        datasets.push({ label: labels[type], data: growthRates, backgroundColor: colors[type] });
    });

    chartInstances.individual = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: results[Object.keys(results)[0]].map(d => `${d.year}년`),
            datasets
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: '연도별 자산 증가율 (%)', font: { size: 20 } } },
            scales: { y: { ticks: { callback: v => v + '%' } } }
        }
    });
}

function renderBreakdownChart() {
    const { results, inputs } = calculationResults;
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    if (chartInstances.breakdown) chartInstances.breakdown.destroy();

    const breakdownData = {};
    Object.keys(results).forEach(type => {
        const last = results[type][results[type].length - 1];
        if (type === 'buy') {
            breakdownData['매수'] = { '자산 가치': last.houseValue, '대출': -last.debt, '누적 비용': -last.costs };
        } else if (type === 'jeonse') {
            breakdownData['전세'] = { '투자 수익': last.investment, '보증금': last.deposit };
        } else if (type === 'monthly') {
            breakdownData['월세'] = { '투자 수익': last.investment, '보증금': last.deposit, '누적 월세': -last.rentPaid };
        }
    });

    const allCats = new Set();
    Object.values(breakdownData).forEach(d => Object.keys(d).forEach(c => allCats.add(c)));
    const cats = Array.from(allCats);
    const colors = ['rgba(99, 102, 241, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)'];

    const datasets = cats.map((cat, i) => ({
        label: cat,
        data: Object.keys(breakdownData).map(opt => breakdownData[opt][cat] || 0),
        backgroundColor: colors[i % colors.length]
    }));

    chartInstances.breakdown = new Chart(ctx, {
        type: 'bar',
        data: { labels: Object.keys(breakdownData), datasets },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: `${inputs.holdingPeriod}년 후 자산 구성`, font: { size: 20 } } },
            scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => v.toFixed(1) + '억' } } }
        }
    });
}

function renderDetailedAnalysis() {
    const { results, inputs } = calculationResults;
    const detailedContent = document.getElementById('detailedContent');
    const initialCapital = inputs.salePrice;
    let html = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; color: white;">
            <h4 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 20px; text-align: center;">💰 한눈에 보는 비교</h4>
            <div style="background: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 12px; color: #1F2937;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #E5E7EB;">
                            <th style="padding: 12px; text-align: left;">항목</th>
                            ${results.buy ? '<th style="padding: 12px; text-align: right;">🏠 매수</th>' : ''}
                            ${results.jeonse ? '<th style="padding: 12px; text-align: right;">🔑 전세</th>' : ''}
                            ${results.monthly ? '<th style="padding: 12px; text-align: right;">📅 월세</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #F3F4F6;">
                            <td style="padding: 12px; font-weight: 600;">초기 투자</td>
                            ${results.buy ? `<td style="padding: 12px; text-align: right;">${initialCapital.toFixed(1)}억</td>` : ''}
                            ${results.jeonse ? `<td style="padding: 12px; text-align: right;">${initialCapital.toFixed(1)}억</td>` : ''}
                            ${results.monthly ? `<td style="padding: 12px; text-align: right;">${initialCapital.toFixed(1)}억</td>` : ''}
                        </tr>
                        <tr style="border-bottom: 1px solid #F3F4F6;">
                            <td style="padding: 12px; font-weight: 600;">${inputs.holdingPeriod}년 후 자산</td>
                            ${results.buy ? `<td style="padding: 12px; text-align: right; font-weight: 700; color: #DC2626;">${results.buy[results.buy.length - 1].asset.toFixed(2)}억</td>` : ''}
                            ${results.jeonse ? `<td style="padding: 12px; text-align: right; font-weight: 700; color: #1E40AF;">${results.jeonse[results.jeonse.length - 1].asset.toFixed(2)}억</td>` : ''}
                            ${results.monthly ? `<td style="padding: 12px; text-align: right; font-weight: 700; color: #047857;">${results.monthly[results.monthly.length - 1].asset.toFixed(2)}억</td>` : ''}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (results.buy) {
        const last = results.buy[results.buy.length - 1];
        const profit = last.asset - initialCapital;
        html += `
            <div style="background: white; border: 3px solid #EF4444; padding: 25px; border-radius: 16px; margin-bottom: 25px;">
                <h4 style="color: #DC2626; margin-bottom: 20px; font-size: 1.3rem; font-weight: 800;">🏠 매수 상세 분석</h4>
                <p style="font-size: 1rem; line-height: 1.6;">
                    ${inputs.salePrice.toFixed(1)}억에 구매한 집이 ${inputs.holdingPeriod}년 후 ${last.houseValue.toFixed(2)}억이 되었습니다.
                    대출 ${(initialCapital * 0.7).toFixed(1)}억을 갚고, 세금·이자 ${last.costs.toFixed(2)}억을 제외하면
                    최종 순자산은 <strong style="color: #DC2626;">${last.asset.toFixed(2)}억</strong>입니다.
                </p>
            </div>
        `;
    }

    if (results.jeonse) {
        const last = results.jeonse[results.jeonse.length - 1];
        html += `
            <div style="background: white; border: 3px solid #3B82F6; padding: 25px; border-radius: 16px; margin-bottom: 25px;">
                <h4 style="color: #1E40AF; margin-bottom: 20px; font-size: 1.3rem; font-weight: 800;">🔑 전세 상세 분석</h4>
                <p style="font-size: 1rem; line-height: 1.6;">
                    전세 보증금 ${inputs.depositPrice.toFixed(1)}억을 제외한 ${(initialCapital - inputs.depositPrice).toFixed(1)}억을 투자하여
                    ${inputs.holdingPeriod}년 후 ${last.investment.toFixed(2)}억이 되었습니다.
                    보증금을 돌려받아 최종 순자산은 <strong style="color: #1E40AF;">${last.asset.toFixed(2)}억</strong>입니다.
                </p>
            </div>
        `;
    }

    if (results.monthly) {
        const last = results.monthly[results.monthly.length - 1];
        html += `
            <div style="background: white; border: 3px solid #10B981; padding: 25px; border-radius: 16px; margin-bottom: 25px;">
                <h4 style="color: #047857; margin-bottom: 20px; font-size: 1.3rem; font-weight: 800;">📅 월세 상세 분석</h4>
                <p style="font-size: 1rem; line-height: 1.6;">
                    월세 보증금 ${inputs.monthlyDeposit.toFixed(1)}억을 제외한 ${(initialCapital - inputs.monthlyDeposit).toFixed(1)}억을 투자했습니다.
                    ${inputs.holdingPeriod}년간 ${last.rentPaid.toFixed(2)}억의 월세를 냈지만, 투자 수익으로
                    최종 순자산은 <strong style="color: #047857;">${last.asset.toFixed(2)}억</strong>입니다.
                </p>
            </div>
        `;
    }

    detailedContent.innerHTML = html;
}

// ========== 히스토리 ==========
function saveToHistory(bestOption, finalAssets, optionNames, inputs) {
    const history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    history.unshift({
        timestamp: Date.now(),
        date: new Date().toLocaleString('ko-KR'),
        bestOption,
        bestOptionName: optionNames[bestOption],
        bestValue: finalAssets[bestOption],
        options: Object.keys(finalAssets).map(k => ({ type: k, name: optionNames[k], value: finalAssets[k] })),
        inputs: {
            salePrice: inputs.salePrice,
            depositPrice: inputs.depositPrice,
            monthlyDeposit: inputs.monthlyDeposit,
            monthlyRent: inputs.monthlyRent,
            holdingPeriod: inputs.holdingPeriod
        }
    });
    if (history.length > 5) history.pop();
    localStorage.setItem('calculationHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    const section = document.getElementById('historySection');
    const list = document.getElementById('historyList');

    if (history.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info">
                <div class="history-title">${item.options.map(o => o.name).join(' vs ')}</div>
                <div class="history-date">${item.date}</div>
            </div>
            <div class="history-result">
                <div class="history-winner">🏆 ${item.bestOptionName}</div>
                <div class="history-amount">${item.bestValue.toFixed(2)}억</div>
            </div>
        `;
        list.appendChild(div);
    });
}
