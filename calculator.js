// ========== 전역 변수 및 DOM 요소 ==========
const step1Screen = document.getElementById('step1Screen');
const step2Screen = document.getElementById('step2Screen');
const step3Screen = document.getElementById('step3Screen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');

let selectedResidenceTypes = [];
let chartInstances = {
    comparison: null,
    individual: null,
    breakdown: null
};
let calculationResults = null;

// ========== Step 1: 주거 형태 선택 ==========
const residenceCheckboxes = document.querySelectorAll('input[name="residence"]');
const step1NextBtn = document.getElementById('step1NextBtn');

// 체크박스 변경 감지
residenceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const checked = document.querySelectorAll('input[name="residence"]:checked');
        // 최소 2개 선택해야 다음 버튼 활성화
        step1NextBtn.disabled = checked.length < 2;
    });
});

// Step 1 -> Step 2
step1NextBtn.addEventListener('click', () => {
    selectedResidenceTypes = Array.from(document.querySelectorAll('input[name="residence"]:checked'))
        .map(cb => cb.value);

    // Step 2에 해당하는 입력 필드만 표시
    document.getElementById('buyInputs').style.display =
        selectedResidenceTypes.includes('buy') ? 'block' : 'none';
    document.getElementById('jeonseInputs').style.display =
        selectedResidenceTypes.includes('jeonse') ? 'block' : 'none';
    document.getElementById('monthlyInputs').style.display =
        selectedResidenceTypes.includes('monthly') ? 'block' : 'none';

    switchScreen(step1Screen, step2Screen);
});

// ========== Step 2: 기본 정보 입력 ==========
document.getElementById('step2BackBtn').addEventListener('click', () => {
    switchScreen(step2Screen, step1Screen);
});

document.getElementById('step2NextBtn').addEventListener('click', () => {
    switchScreen(step2Screen, step3Screen);
});

// 고급 설정 건너뛰기 -> 바로 계산
document.getElementById('skipAdvancedBtn').addEventListener('click', () => {
    // 입력값 검증
    const inputs = getInputValues();
    const errors = validateInputs(inputs, selectedResidenceTypes);

    if (errors.length > 0) {
        showValidationErrors(errors, step2Screen);
        return;
    }

    // 로딩 화면으로
    switchScreen(step2Screen, loadingScreen);

    setTimeout(() => {
        performCalculation(inputs, selectedResidenceTypes);
        switchScreen(loadingScreen, resultScreen);
    }, 1500);
});

// ========== Step 3: 고급 설정 ==========
document.getElementById('step3BackBtn').addEventListener('click', () => {
    switchScreen(step3Screen, step2Screen);
});

document.getElementById('calculateBtn').addEventListener('click', () => {
    const inputs = getInputValues();
    const errors = validateInputs(inputs, selectedResidenceTypes);

    if (errors.length > 0) {
        showValidationErrors(errors, step3Screen);
        return;
    }

    switchScreen(step3Screen, loadingScreen);

    setTimeout(() => {
        performCalculation(inputs, selectedResidenceTypes);
        switchScreen(loadingScreen, resultScreen);
    }, 1500);
});

// ========== 슬라이더 동기화 ==========
function syncSliderWithInput(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);

    if (!slider || !input) return;

    // 슬라이더 변경 → 입력 필드 업데이트
    slider.addEventListener('input', (e) => {
        input.value = e.target.value;
    });

    // 입력 필드 변경 → 슬라이더 업데이트
    input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);

            // 슬라이더 범위 내로 제한
            if (value < min) {
                slider.value = min;
            } else if (value > max) {
                slider.value = max;
            } else {
                slider.value = value;
            }
        }
    });

    // 초기값 동기화
    if (input.value) {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            slider.value = Math.min(Math.max(value, parseFloat(slider.min)), parseFloat(slider.max));
        }
    }
}

syncSliderWithInput('salePriceSlider', 'salePrice');
syncSliderWithInput('depositPriceSlider', 'depositPrice');
syncSliderWithInput('monthlyDepositSlider', 'monthlyDeposit');
syncSliderWithInput('monthlyRentSlider', 'monthlyRent');
syncSliderWithInput('loanRateSlider', 'loanRate');
syncSliderWithInput('appreciationRateSlider', 'appreciationRate');
syncSliderWithInput('investmentReturnSlider', 'investmentReturn');
syncSliderWithInput('holdingPeriodSlider', 'holdingPeriod');

// ========== 화면 전환 함수 ==========
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

// ========== 입력값 검증 ==========
function validateInputs(inputs, selectedTypes) {
    const errors = [];

    if (selectedTypes.includes('buy')) {
        if (inputs.salePrice <= 0) errors.push('매매가를 입력해주세요.');
    }

    if (selectedTypes.includes('jeonse')) {
        if (inputs.depositPrice <= 0) errors.push('전세 보증금을 입력해주세요.');
    }

    if (selectedTypes.includes('monthly')) {
        if (inputs.monthlyRent <= 0) errors.push('월세 임대료를 입력해주세요.');
    }

    return errors;
}

// ========== 검증 에러 표시 ==========
function showValidationErrors(errors, screen) {
    const existingError = screen.querySelector('.validation-error');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.innerHTML = `
        <div style="background: #FEE2E2; border: 2px solid #EF4444; border-radius: 12px; padding: 20px; margin: 20px 0; animation: fadeInUp 0.5s ease;">
            <h4 style="color: #DC2626; margin-bottom: 10px; font-size: 1.1rem;">⚠️ 입력값을 확인해주세요</h4>
            <ul style="color: #991B1B; margin-left: 20px;">
                ${errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
        </div>
    `;

    const inputSection = screen.querySelector('.input-section');
    inputSection.insertBefore(errorDiv, inputSection.firstChild);

    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => errorDiv.remove(), 500);
    }, 5000);
}

// ========== 매수 시나리오 계산 ==========
function calculateBuyScenario(inputs) {
    const { salePrice, loanRate, acquisitionTax, propertyTax, appreciationRate, holdingPeriod } = inputs;

    const acquisitionCost = salePrice * acquisitionTax;
    // LTV 70% 기준으로 대출 (자기자본 30%)
    const loanAmount = salePrice * 0.7;

    let yearlyData = [];
    let cumulativeCosts = acquisitionCost;

    for (let year = 0; year <= holdingPeriod; year++) {
        const currentHouseValue = salePrice * Math.pow(1 + appreciationRate, year);

        if (year > 0) {
            const annualInterest = loanAmount * loanRate;
            const annualCost = annualInterest + propertyTax;
            cumulativeCosts += annualCost;
        }

        const netAsset = currentHouseValue - loanAmount - cumulativeCosts;

        yearlyData.push({
            year: year,
            asset: netAsset,
            houseValue: currentHouseValue,
            debt: loanAmount,
            costs: cumulativeCosts
        });
    }

    return yearlyData;
}

// ========== 전세 시나리오 계산 ==========
function calculateJeonseScenario(inputs) {
    const { salePrice, depositPrice, investmentReturn, holdingPeriod } = inputs;
    // 매수와 동일한 초기 자본을 가정, 전세 보증금을 제외한 나머지를 투자
    const initialCapital = salePrice;
    const investableAmount = initialCapital - depositPrice;

    let yearlyData = [];

    for (let year = 0; year <= holdingPeriod; year++) {
        const investmentValue = investableAmount * Math.pow(1 + investmentReturn, year);
        const totalAsset = investmentValue + depositPrice;

        yearlyData.push({
            year: year,
            asset: totalAsset,
            investment: investmentValue,
            deposit: depositPrice
        });
    }

    return yearlyData;
}

// ========== 월세 시나리오 계산 ==========
function calculateMonthlyRentScenario(inputs) {
    const { salePrice, monthlyDeposit, monthlyRent, investmentReturn, holdingPeriod } = inputs;
    // 매수와 동일한 초기 자본을 가정, 월세 보증금을 제외한 나머지를 투자
    const initialCapital = salePrice;
    const investableAmount = initialCapital - monthlyDeposit;

    let yearlyData = [];

    for (let year = 0; year <= holdingPeriod; year++) {
        const investmentValue = investableAmount * Math.pow(1 + investmentReturn, year);
        const cumulativeRent = monthlyRent * 12 * year;
        const totalAsset = investmentValue + monthlyDeposit - cumulativeRent;

        yearlyData.push({
            year: year,
            asset: totalAsset,
            investment: investmentValue,
            deposit: monthlyDeposit,
            rentPaid: cumulativeRent
        });
    }

    return yearlyData;
}

// ========== 계산 수행 ==========
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

    const bestOption = Object.keys(finalAssets).reduce((a, b) =>
        finalAssets[a] > finalAssets[b] ? a : b
    );

    const optionNames = {
        buy: '매수',
        jeonse: '전세',
        monthly: '월세'
    };

    renderVerdict(bestOption, finalAssets, optionNames, inputs.holdingPeriod);
    renderComparisonChart();
    renderIndividualChart();
    renderBreakdownChart();
    renderDetailedAnalysis();
}

// ========== 판정 렌더링 ==========
function renderVerdict(bestOption, finalAssets, optionNames, holdingPeriod) {
    const verdictContent = document.getElementById('verdictContent');

    const bestValue = finalAssets[bestOption];
    const optionsList = Object.keys(finalAssets);

    let comparisonHTML = '';
    optionsList.forEach(option => {
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
                    <div style="font-size: 1.3rem; font-weight: 700; color: ${option === bestOption ? '#6366F1' : '#6B7280'};">${finalAssets[option].toFixed(2)}억</div>
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
}

// ========== 비교 그래프 렌더링 ==========
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

    const labels = {
        buy: '🏠 매수',
        jeonse: '🔑 전세',
        monthly: '📅 월세'
    };

    Object.keys(results).forEach(type => {
        datasets.push({
            label: labels[type],
            data: results[type].map(d => d.asset),
            borderColor: colors[type].border,
            backgroundColor: colors[type].bg,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 8
        });
    });

    chartInstances.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: results[Object.keys(results)[0]].map(d => `${d.year}년`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                title: {
                    display: true,
                    text: '자산 변화 추이 비교',
                    font: { size: 20, weight: 'bold' },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}억 원`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => value.toFixed(1) + '억'
                    },
                    title: {
                        display: true,
                        text: '순자산 (억원)',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '보유 기간',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// ========== 개별 그래프 렌더링 ==========
function renderIndividualChart() {
    const { results } = calculationResults;
    const ctx = document.getElementById('individualChart').getContext('2d');

    if (chartInstances.individual) chartInstances.individual.destroy();

    const datasets = [];
    const colors = {
        buy: 'rgb(239, 68, 68)',
        jeonse: 'rgb(59, 130, 246)',
        monthly: 'rgb(16, 185, 129)'
    };

    const labels = {
        buy: '🏠 매수',
        jeonse: '🔑 전세',
        monthly: '📅 월세'
    };

    Object.keys(results).forEach(type => {
        const data = results[type];
        const growthRates = data.map((d, i) => {
            if (i === 0) return 0;
            const prevAsset = data[i - 1].asset;
            if (prevAsset === 0) return 0;
            return ((d.asset - prevAsset) / Math.abs(prevAsset)) * 100;
        });

        datasets.push({
            label: labels[type],
            data: growthRates,
            backgroundColor: colors[type],
            borderColor: colors[type],
            borderWidth: 2
        });
    });

    chartInstances.individual = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: results[Object.keys(results)[0]].map(d => `${d.year}년`),
            datasets: datasets
        },
        options: {
            responsive: true,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                title: {
                    display: true,
                    text: '연도별 자산 증가율 (%)',
                    font: { size: 20, weight: 'bold' },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '증가율 (%)',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// ========== 비용 분석 그래프 렌더링 ==========
function renderBreakdownChart() {
    const { results, inputs } = calculationResults;
    const ctx = document.getElementById('breakdownChart').getContext('2d');

    if (chartInstances.breakdown) chartInstances.breakdown.destroy();

    const breakdownData = {};

    Object.keys(results).forEach(type => {
        const lastYear = results[type][results[type].length - 1];

        if (type === 'buy') {
            breakdownData['매수'] = {
                '자산 가치': lastYear.houseValue,
                '대출': -lastYear.debt,
                '누적 비용': -lastYear.costs
            };
        } else if (type === 'jeonse') {
            breakdownData['전세'] = {
                '투자 수익': lastYear.investment,
                '보증금': lastYear.deposit
            };
        } else if (type === 'monthly') {
            breakdownData['월세'] = {
                '투자 수익': lastYear.investment,
                '보증금': lastYear.deposit,
                '누적 월세': -lastYear.rentPaid
            };
        }
    });

    const datasets = [];
    const allCategories = new Set();

    Object.values(breakdownData).forEach(data => {
        Object.keys(data).forEach(cat => allCategories.add(cat));
    });

    const categoryArray = Array.from(allCategories);
    const colors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)'
    ];

    categoryArray.forEach((category, index) => {
        datasets.push({
            label: category,
            data: Object.keys(breakdownData).map(option => breakdownData[option][category] || 0),
            backgroundColor: colors[index % colors.length]
        });
    });

    chartInstances.breakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(breakdownData),
            datasets: datasets
        },
        options: {
            responsive: true,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                title: {
                    display: true,
                    text: `${inputs.holdingPeriod}년 후 자산 구성`,
                    font: { size: 20, weight: 'bold' },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}억`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: value => value.toFixed(1) + '억'
                    }
                }
            }
        }
    });
}

// ========== 상세 분석 렌더링 ==========
function renderDetailedAnalysis() {
    const { results, inputs } = calculationResults;
    const detailedContent = document.getElementById('detailedContent');

    let analysisHTML = '';
    const initialCapital = inputs.salePrice;

    // 비교 요약 테이블 추가
    analysisHTML += `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; color: white;">
            <h4 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 20px; text-align: center;">💰 한눈에 보는 비교</h4>
            <div style="background: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 12px; color: #1F2937;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #E5E7EB;">
                            <th style="padding: 12px; text-align: left; font-size: 0.95rem; color: #6B7280;">항목</th>
                            ${results.buy ? '<th style="padding: 12px; text-align: right; font-size: 0.95rem; color: #6B7280;">🏠 매수</th>' : ''}
                            ${results.jeonse ? '<th style="padding: 12px; text-align: right; font-size: 0.95rem; color: #6B7280;">🔑 전세</th>' : ''}
                            ${results.monthly ? '<th style="padding: 12px; text-align: right; font-size: 0.95rem; color: #6B7280;">📅 월세</th>' : ''}
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
                        <tr style="background: #F9FAFB;">
                            <td style="padding: 12px; font-weight: 600;">순이익/손실</td>
                            ${results.buy ? `<td style="padding: 12px; text-align: right; font-weight: 700; color: ${(results.buy[results.buy.length - 1].asset - initialCapital) >= 0 ? '#10B981' : '#EF4444'};">${(results.buy[results.buy.length - 1].asset - initialCapital) >= 0 ? '+' : ''}${(results.buy[results.buy.length - 1].asset - initialCapital).toFixed(2)}억</td>` : ''}
                            ${results.jeonse ? `<td style="padding: 12px; text-align: right; font-weight: 700; color: ${(results.jeonse[results.jeonse.length - 1].asset - initialCapital) >= 0 ? '#10B981' : '#EF4444'};">${(results.jeonse[results.jeonse.length - 1].asset - initialCapital) >= 0 ? '+' : ''}${(results.jeonse[results.jeonse.length - 1].asset - initialCapital).toFixed(2)}억</td>` : ''}
                            ${results.monthly ? `<td style="padding: 12px; text-align: right; font-weight: 700; color: ${(results.monthly[results.monthly.length - 1].asset - initialCapital) >= 0 ? '#10B981' : '#EF4444'};">${(results.monthly[results.monthly.length - 1].asset - initialCapital) >= 0 ? '+' : ''}${(results.monthly[results.monthly.length - 1].asset - initialCapital).toFixed(2)}억</td>` : ''}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (results.buy) {
        const finalData = results.buy[results.buy.length - 1];
        const equity = initialCapital * 0.3; // 자기자본 30%
        const loan = initialCapital * 0.7; // 대출 70%
        const profit = finalData.asset - initialCapital;
        const houseValueGain = finalData.houseValue - inputs.salePrice;

        analysisHTML += `
            <div style="background: white; border: 3px solid #EF4444; padding: 25px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h4 style="color: #DC2626; margin-bottom: 20px; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
                    🏠 매수 상세 분석
                </h4>

                <div style="background: #FEF2F2; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h5 style="color: #991B1B; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">💰 초기 투자 구조</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div>
                            <p style="color: #991B1B; font-size: 0.85rem; margin-bottom: 5px;">매매가</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #DC2626;">${inputs.salePrice.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #991B1B; font-size: 0.85rem; margin-bottom: 5px;">자기자본 (30%)</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #DC2626;">${equity.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #991B1B; font-size: 0.85rem; margin-bottom: 5px;">대출 (70%)</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #DC2626;">${loan.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #991B1B; font-size: 0.85rem; margin-bottom: 5px;">취득세 등</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #DC2626;">${finalData.costs.toFixed(2)}억</p>
                        </div>
                    </div>
                </div>

                <div style="background: #FEE2E2; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h5 style="color: #991B1B; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">📈 ${inputs.holdingPeriod}년간 수익/비용</h5>
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #7C2D12;">집값 상승</span>
                            <span style="font-weight: 700; color: ${houseValueGain >= 0 ? '#10B981' : '#EF4444'};">${houseValueGain >= 0 ? '+' : ''}${houseValueGain.toFixed(2)}억 (${((finalData.houseValue / inputs.salePrice - 1) * 100).toFixed(1)}%)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #7C2D12;">대출이자 + 보유세</span>
                            <span style="font-weight: 700; color: #EF4444;">-${(finalData.costs - inputs.salePrice * inputs.acquisitionTax).toFixed(2)}억</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #7C2D12;">남은 대출금</span>
                            <span style="font-weight: 700; color: #EF4444;">-${loan.toFixed(1)}억</span>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%); padding: 20px; border-radius: 12px;">
                    <h5 style="color: #991B1B; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">🎯 최종 결과</h5>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px;">
                        <span style="font-size: 1rem; color: #6B7280;">최종 순자산</span>
                        <span style="font-size: 1.5rem; font-weight: 800; color: #DC2626;">${finalData.asset.toFixed(2)}억</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px;">
                        <span style="font-size: 1rem; color: #6B7280;">순이익/손실</span>
                        <span style="font-size: 1.5rem; font-weight: 800; color: ${profit >= 0 ? '#10B981' : '#EF4444'};">${profit >= 0 ? '+' : ''}${profit.toFixed(2)}억</span>
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: rgba(220, 38, 38, 0.1); border-radius: 8px; border-left: 4px solid #DC2626;">
                        <p style="font-size: 0.95rem; color: #7C2D12; line-height: 1.6;">
                            💡 <strong>이렇게 계산했어요:</strong> 집을 ${inputs.salePrice.toFixed(1)}억에 구매하고, ${inputs.holdingPeriod}년 동안 ${finalData.houseValue.toFixed(2)}억으로 상승했습니다.
                            하지만 ${inputs.holdingPeriod}년간 대출이자와 세금으로 ${(finalData.costs - inputs.salePrice * inputs.acquisitionTax).toFixed(2)}억이 들었고,
                            대출금 ${loan.toFixed(1)}억을 갚아야 해서 최종적으로 ${profit >= 0 ? profit.toFixed(2) + '억 이익' : Math.abs(profit).toFixed(2) + '억 손해'}입니다.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    if (results.jeonse) {
        const finalData = results.jeonse[results.jeonse.length - 1];
        const investedAmount = initialCapital - inputs.depositPrice;
        const profit = finalData.asset - initialCapital;
        const investmentGain = finalData.investment - investedAmount;

        analysisHTML += `
            <div style="background: white; border: 3px solid #3B82F6; padding: 25px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h4 style="color: #1E40AF; margin-bottom: 20px; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
                    🔑 전세 상세 분석
                </h4>

                <div style="background: #EFF6FF; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h5 style="color: #1E3A8A; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">💰 초기 투자 구조</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div>
                            <p style="color: #1E3A8A; font-size: 0.85rem; margin-bottom: 5px;">초기 자본</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #1E40AF;">${initialCapital.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #1E3A8A; font-size: 0.85rem; margin-bottom: 5px;">전세 보증금</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #1E40AF;">${inputs.depositPrice.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #1E3A8A; font-size: 0.85rem; margin-bottom: 5px;">투자 금액</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #1E40AF;">${investedAmount.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #1E3A8A; font-size: 0.85rem; margin-bottom: 5px;">투자 수익률</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #1E40AF;">${(inputs.investmentReturn * 100).toFixed(1)}%/년</p>
                        </div>
                    </div>
                </div>

                <div style="background: #DBEAFE; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h5 style="color: #1E3A8A; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">📈 ${inputs.holdingPeriod}년간 자산 변화</h5>
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #1E40AF;">투자 수익</span>
                            <span style="font-weight: 700; color: #10B981;">+${investmentGain.toFixed(2)}억</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #1E40AF;">전세 보증금 (돌려받음)</span>
                            <span style="font-weight: 700; color: #6B7280;">${inputs.depositPrice.toFixed(1)}억</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #1E40AF;">월세 절약</span>
                            <span style="font-weight: 700; color: #10B981;">매달 임대료 없음</span>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%); padding: 20px; border-radius: 12px;">
                    <h5 style="color: #1E3A8A; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">🎯 최종 결과</h5>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px;">
                        <span style="font-size: 1rem; color: #6B7280;">최종 순자산</span>
                        <span style="font-size: 1.5rem; font-weight: 800; color: #1E40AF;">${finalData.asset.toFixed(2)}억</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px;">
                        <span style="font-size: 1rem; color: #6B7280;">순이익/손실</span>
                        <span style="font-size: 1.5rem; font-weight: 800; color: ${profit >= 0 ? '#10B981' : '#EF4444'};">${profit >= 0 ? '+' : ''}${profit.toFixed(2)}억</span>
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border-left: 4px solid #3B82F6;">
                        <p style="font-size: 0.95rem; color: #1E40AF; line-height: 1.6;">
                            💡 <strong>이렇게 계산했어요:</strong> ${initialCapital.toFixed(1)}억 중 ${inputs.depositPrice.toFixed(1)}억을 전세 보증금으로 내고,
                            나머지 ${investedAmount.toFixed(1)}억을 ${(inputs.investmentReturn * 100).toFixed(1)}% 수익률로 투자했습니다.
                            ${inputs.holdingPeriod}년 후 투자금이 ${finalData.investment.toFixed(2)}억으로 불어났고, 보증금 ${inputs.depositPrice.toFixed(1)}억을 돌려받아
                            총 ${finalData.asset.toFixed(2)}억이 되어 ${profit >= 0 ? profit.toFixed(2) + '억 이익' : Math.abs(profit).toFixed(2) + '억 손해'}입니다.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    if (results.monthly) {
        const finalData = results.monthly[results.monthly.length - 1];
        const investedAmount = initialCapital - inputs.monthlyDeposit;
        const profit = finalData.asset - initialCapital;
        const investmentGain = finalData.investment - investedAmount;
        const totalRent = finalData.rentPaid;

        analysisHTML += `
            <div style="background: white; border: 3px solid #10B981; padding: 25px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h4 style="color: #047857; margin-bottom: 20px; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
                    📅 월세 상세 분석
                </h4>

                <div style="background: #ECFDF5; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h5 style="color: #065F46; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">💰 초기 투자 구조</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div>
                            <p style="color: #065F46; font-size: 0.85rem; margin-bottom: 5px;">초기 자본</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #047857;">${initialCapital.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #065F46; font-size: 0.85rem; margin-bottom: 5px;">월세 보증금</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #047857;">${inputs.monthlyDeposit.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #065F46; font-size: 0.85rem; margin-bottom: 5px;">투자 금액</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #047857;">${investedAmount.toFixed(1)}억</p>
                        </div>
                        <div>
                            <p style="color: #065F46; font-size: 0.85rem; margin-bottom: 5px;">월 임대료</p>
                            <p style="font-size: 1.2rem; font-weight: 700; color: #047857;">${(inputs.monthlyRent * 10000).toFixed(0)}만원</p>
                        </div>
                    </div>
                </div>

                <div style="background: #D1FAE5; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h5 style="color: #065F46; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">📈 ${inputs.holdingPeriod}년간 수익/비용</h5>
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #047857;">투자 수익</span>
                            <span style="font-weight: 700; color: #10B981;">+${investmentGain.toFixed(2)}억</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #047857;">누적 월세 지출</span>
                            <span style="font-weight: 700; color: #EF4444;">-${totalRent.toFixed(2)}억 (${(inputs.monthlyRent * 10000).toFixed(0)}만원 × ${inputs.holdingPeriod * 12}개월)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #047857;">월세 보증금 (돌려받음)</span>
                            <span style="font-weight: 700; color: #6B7280;">${inputs.monthlyDeposit.toFixed(1)}억</span>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%); padding: 20px; border-radius: 12px;">
                    <h5 style="color: #065F46; font-size: 1.1rem; margin-bottom: 15px; font-weight: 700;">🎯 최종 결과</h5>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px;">
                        <span style="font-size: 1rem; color: #6B7280;">최종 순자산</span>
                        <span style="font-size: 1.5rem; font-weight: 800; color: #047857;">${finalData.asset.toFixed(2)}억</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; border-radius: 8px;">
                        <span style="font-size: 1rem; color: #6B7280;">순이익/손실</span>
                        <span style="font-size: 1.5rem; font-weight: 800; color: ${profit >= 0 ? '#10B981' : '#EF4444'};">${profit >= 0 ? '+' : ''}${profit.toFixed(2)}억</span>
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border-left: 4px solid #10B981;">
                        <p style="font-size: 0.95rem; color: #047857; line-height: 1.6;">
                            💡 <strong>이렇게 계산했어요:</strong> ${initialCapital.toFixed(1)}억 중 ${inputs.monthlyDeposit.toFixed(1)}억을 월세 보증금으로 내고,
                            나머지 ${investedAmount.toFixed(1)}억을 투자했습니다. ${inputs.holdingPeriod}년간 투자금이 ${finalData.investment.toFixed(2)}억으로 불어났지만,
                            매달 ${(inputs.monthlyRent * 10000).toFixed(0)}만원씩 총 ${totalRent.toFixed(2)}억을 월세로 냈습니다.
                            보증금 ${inputs.monthlyDeposit.toFixed(1)}억을 돌려받아 최종적으로 ${profit >= 0 ? profit.toFixed(2) + '억 이익' : Math.abs(profit).toFixed(2) + '억 손해'}입니다.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    detailedContent.innerHTML = analysisHTML;
}

// ========== 차트 탭 전환 ==========
const chartTabs = document.querySelectorAll('.chart-tab');
const chartPanels = document.querySelectorAll('.chart-panel');

chartTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const chartType = tab.getAttribute('data-chart');

        chartTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        chartPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`chart${chartType.charAt(0).toUpperCase() + chartType.slice(1)}`).classList.add('active');
    });
});

// ========== 뒤로 가기 ==========
document.getElementById('backBtn').addEventListener('click', () => {
    switchScreen(resultScreen, step1Screen);
});

// ========== 공유 버튼 ==========
document.getElementById('shareBtn').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: '집, 살까 말까? 계산 결과',
            text: '내 부동산 투자 시뮬레이션 결과를 확인해보세요!',
            url: window.location.href
        }).catch(err => console.log('공유 실패:', err));
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = document.getElementById('shareBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>✓</span> 링크가 복사되었습니다!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        });
    }
});

// ========== 이미지 저장 ==========
document.getElementById('saveImageBtn').addEventListener('click', () => {
    const resultContainer = document.querySelector('#resultScreen .container');
    const saveBtn = document.getElementById('saveImageBtn');

    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span>📸</span> 저장 중...';
    saveBtn.disabled = true;

    html2canvas(resultContainer, {
        backgroundColor: '#F9FAFB',
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: resultContainer.scrollWidth,
        windowHeight: resultContainer.scrollHeight
    }).then(canvas => {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.download = `부동산_계산_결과_${date}.png`;
            link.href = url;
            link.click();

            URL.revokeObjectURL(url);

            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = false;
        });
    }).catch(err => {
        console.error('이미지 저장 실패:', err);
        saveBtn.innerHTML = originalHTML;
        saveBtn.disabled = false;
    });
});

// ========== 설명 모달 ==========
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const startBtn = document.getElementById('startBtn');

infoBtn.addEventListener('click', () => {
    infoModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    infoModal.classList.remove('active');
});

startBtn.addEventListener('click', () => {
    infoModal.classList.remove('active');
});

// 모달 배경 클릭 시 닫기
infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.classList.remove('active');
    }
});
