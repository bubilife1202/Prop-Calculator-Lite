// DOM 요소
const simpleModeBtn = document.getElementById('simpleMode');
const advancedModeBtn = document.getElementById('advancedMode');
const advancedInputs = document.getElementById('advancedInputs');
const calculateBtn = document.getElementById('calculateBtn');
const loadingScreen = document.getElementById('loadingScreen');
const resultSection = document.getElementById('resultSection');
const simpleResult = document.getElementById('simpleResult');
const advancedResult = document.getElementById('advancedResult');

// 현재 모드
let currentMode = 'simple';

// 슬라이더 - 입력창 동기화
function syncSliderWithInput(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);

    slider.addEventListener('input', (e) => {
        input.value = e.target.value;
    });

    input.addEventListener('input', (e) => {
        slider.value = e.target.value;
    });
}

// 모든 슬라이더 동기화
syncSliderWithInput('salePriceSlider', 'salePrice');
syncSliderWithInput('depositPriceSlider', 'depositPrice');
syncSliderWithInput('myCashSlider', 'myCash');
syncSliderWithInput('loanRateSlider', 'loanRate');
syncSliderWithInput('appreciationRateSlider', 'appreciationRate');
syncSliderWithInput('investmentReturnSlider', 'investmentReturn');
syncSliderWithInput('holdingPeriodSlider', 'holdingPeriod');

// 모드 전환
simpleModeBtn.addEventListener('click', () => {
    currentMode = 'simple';
    simpleModeBtn.classList.add('active');
    advancedModeBtn.classList.remove('active');
    advancedInputs.style.display = 'none';
});

advancedModeBtn.addEventListener('click', () => {
    currentMode = 'advanced';
    advancedModeBtn.classList.add('active');
    simpleModeBtn.classList.remove('active');
    advancedInputs.style.display = 'block';
});

// 입력값 가져오기
function getInputValues() {
    return {
        salePrice: parseFloat(document.getElementById('salePrice').value),
        depositPrice: parseFloat(document.getElementById('depositPrice').value),
        myCash: parseFloat(document.getElementById('myCash').value),
        loanRate: parseFloat(document.getElementById('loanRate').value) / 100,
        acquisitionTax: parseFloat(document.getElementById('acquisitionTax').value) / 100,
        propertyTax: parseFloat(document.getElementById('propertyTax').value) / 10000, // 만원 -> 억원
        appreciationRate: parseFloat(document.getElementById('appreciationRate').value) / 100,
        investmentReturn: parseFloat(document.getElementById('investmentReturn').value) / 100,
        holdingPeriod: parseInt(document.getElementById('holdingPeriod').value)
    };
}

// 매수 시나리오 계산
function calculateBuyScenario(inputs) {
    const { salePrice, myCash, loanRate, acquisitionTax, propertyTax, appreciationRate, holdingPeriod } = inputs;

    // 초기 비용
    const acquisitionCost = salePrice * acquisitionTax;
    const loanAmount = salePrice - myCash;

    // 연도별 자산 계산
    let yearlyData = [];
    let currentHouseValue = salePrice;
    let remainingLoan = loanAmount;

    for (let year = 0; year <= holdingPeriod; year++) {
        // 0년차: 초기 상태
        if (year === 0) {
            yearlyData.push({
                year: 0,
                asset: currentHouseValue - remainingLoan - acquisitionCost
            });
        } else {
            // 집값 상승
            currentHouseValue = currentHouseValue * (1 + appreciationRate);

            // 연간 비용 (대출 이자 + 보유세)
            const annualInterest = remainingLoan * loanRate;
            const annualCost = annualInterest + propertyTax;

            // 순자산 = 현재 집값 - 남은 대출 - 누적 비용
            const netAsset = currentHouseValue - remainingLoan - (acquisitionCost + annualCost * year);

            yearlyData.push({
                year: year,
                asset: netAsset
            });
        }
    }

    return yearlyData;
}

// 전세 시나리오 계산
function calculateRentScenario(inputs) {
    const { depositPrice, myCash, investmentReturn, holdingPeriod } = inputs;

    // 투자 가능 금액
    const investableAmount = myCash - depositPrice;

    // 연도별 자산 계산
    let yearlyData = [];
    let currentInvestment = investableAmount;

    for (let year = 0; year <= holdingPeriod; year++) {
        if (year === 0) {
            yearlyData.push({
                year: 0,
                asset: investableAmount + depositPrice
            });
        } else {
            // 복리 수익
            currentInvestment = investableAmount * Math.pow(1 + investmentReturn, year);

            yearlyData.push({
                year: year,
                asset: currentInvestment + depositPrice
            });
        }
    }

    return yearlyData;
}

// 손익분기점 찾기
function findBreakEvenPoint(buyData, rentData) {
    for (let i = 1; i < buyData.length; i++) {
        if (buyData[i].asset > rentData[i].asset) {
            return i;
        }
    }
    return null; // 손익분기점이 없음
}

// Chart.js 인스턴스 저장 (재생성 시 기존 차트 파괴용)
let chartInstance = null;

// 그래프 그리기
function drawChart(buyData, rentData, breakEvenYear) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // 기존 차트가 있으면 파괴
    if (chartInstance) {
        chartInstance.destroy();
    }

    // 레이블 (년도)
    const labels = buyData.map(d => `${d.year}년`);

    // 매수 자산 데이터
    const buyAssets = buyData.map(d => d.asset);

    // 전세 자산 데이터
    const rentAssets = rentData.map(d => d.asset);

    // 손익분기점 표시를 위한 주석 (annotation)
    const annotations = {};
    if (breakEvenYear && breakEvenYear < buyData.length) {
        annotations.breakEven = {
            type: 'point',
            xValue: breakEvenYear,
            yValue: buyData[breakEvenYear].asset,
            backgroundColor: 'rgba(255, 206, 86, 0.8)',
            borderColor: 'rgb(255, 206, 86)',
            borderWidth: 2,
            radius: 8,
            label: {
                display: true,
                content: ['🚩 손익분기점', `${breakEvenYear}년`],
                position: 'top',
                backgroundColor: 'rgba(255, 206, 86, 0.9)',
                color: '#333',
                font: {
                    size: 12,
                    weight: 'bold'
                },
                padding: 8,
                borderRadius: 6
            }
        };
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '🔴 매수 시 자산',
                    data: buyAssets,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: '🔵 전세+투자 자산',
                    data: rentAssets,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: '자산 변화 추이 (골든 크로스 분석)',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(2) + '억 원';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '억';
                        },
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: '순자산 (억원)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: '보유 기간',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 결과 표시
function displayResults(buyData, rentData, inputs) {
    const finalBuyAsset = buyData[buyData.length - 1].asset;
    const finalRentAsset = rentData[rentData.length - 1].asset;
    const assetDiff = finalBuyAsset - finalRentAsset;
    const breakEvenYear = findBreakEvenPoint(buyData, rentData);

    // 판정
    let verdict = '';
    if (assetDiff > 0) {
        verdict = `사장님의 상황에서는 <strong>"매수"</strong>가 유리합니다.`;
    } else {
        verdict = `사장님의 상황에서는 <strong>"전세 살며 투자"</strong>가 유리합니다.`;
    }

    // 자산 차이
    const assetDiffText = `${inputs.holdingPeriod}년 뒤 자산 차이: <strong>${assetDiff > 0 ? '+' : ''}${assetDiff.toFixed(2)}억 원</strong> (${assetDiff > 0 ? '매수 승!' : '전세 승!'})`;

    // 팁 생성
    let tip = '';
    if (assetDiff < 0) {
        // 매수가 불리한 경우, 얼마나 집값이 올라야 유리한지 계산
        const requiredAppreciationRate = ((inputs.investmentReturn + 1) * (inputs.salePrice / (inputs.salePrice - inputs.depositPrice)) - 1) * 100;
        tip = `집값 상승률이 연 ${requiredAppreciationRate.toFixed(1)}% 이상이어야 매수가 유리해집니다.`;
    } else {
        tip = `현재 설정에서는 ${breakEvenYear ? breakEvenYear + '년 뒤부터' : '처음부터'} 매수가 유리합니다.`;
    }

    // 화면에 표시
    document.getElementById('verdictText').innerHTML = verdict;
    document.getElementById('assetDiff').innerHTML = assetDiffText;
    document.getElementById('tip').innerHTML = tip;

    // 고급 모드에서는 그래프도 표시
    if (currentMode === 'advanced') {
        advancedResult.style.display = 'block';
        // Chart.js 그래프 그리기
        drawChart(buyData, rentData, breakEvenYear);
    } else {
        advancedResult.style.display = 'none';
    }
}

// 계산 버튼 클릭
calculateBtn.addEventListener('click', () => {
    // 입력값 검증
    const inputs = getInputValues();

    if (inputs.salePrice <= 0 || inputs.depositPrice <= 0 || inputs.myCash < 0) {
        alert('올바른 값을 입력해주세요.');
        return;
    }

    if (inputs.myCash < inputs.depositPrice) {
        alert('현금이 전세 보증금보다 적습니다. 전세를 살 수 없습니다.');
        return;
    }

    if (inputs.salePrice < inputs.myCash) {
        alert('현금이 매매가보다 많습니다. 대출 없이 매수 가능합니다.');
        // 계속 진행
    }

    // 로딩 화면 표시
    loadingScreen.style.display = 'flex';
    resultSection.style.display = 'none';

    // 1.5초 후 결과 표시 (광고 노출 시간)
    setTimeout(() => {
        // 계산
        const buyData = calculateBuyScenario(inputs);
        const rentData = calculateRentScenario(inputs);

        // 결과 표시
        displayResults(buyData, rentData, inputs);

        // 로딩 화면 숨기고 결과 화면 표시
        loadingScreen.style.display = 'none';
        resultSection.style.display = 'block';

        // 결과 화면으로 스크롤
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
});

// 공유 버튼 (나중에 구현)
document.getElementById('shareBtn').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: '집, 살까 말까? 계산 결과',
            text: '내 부동산 투자 시뮬레이션 결과를 확인해보세요!',
            url: window.location.href
        }).catch(err => console.log('공유 실패:', err));
    } else {
        alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
    }
});

// 이미지 저장 버튼
document.getElementById('saveImageBtn').addEventListener('click', () => {
    const resultSection = document.getElementById('resultSection');

    // 로딩 표시
    const saveBtn = document.getElementById('saveImageBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '📸 저장 중...';
    saveBtn.disabled = true;

    // html2canvas로 결과 화면 캡처
    html2canvas(resultSection, {
        backgroundColor: '#F9FAFB',
        scale: 2, // 고해상도
        logging: false,
        useCORS: true
    }).then(canvas => {
        // Canvas를 이미지로 변환
        canvas.toBlob((blob) => {
            // 다운로드 링크 생성
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.download = `부동산_계산_결과_${date}.png`;
            link.href = url;
            link.click();

            // 메모리 정리
            URL.revokeObjectURL(url);

            // 버튼 원상복구
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        });
    }).catch(err => {
        console.error('이미지 저장 실패:', err);
        alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');

        // 버튼 원상복구
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    });
});
