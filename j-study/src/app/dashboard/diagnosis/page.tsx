"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend, RadarController } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend, RadarController);

// 20개 문항 데이터
const questionsText = [
  "공부를 시작할 때 오늘 무엇을 끝내야 할지 명확하게 알고 있다.",
  "계획한 공부 분량의 80% 이상을 꾸준히 실천한다.",
  "문제를 풀고 나서 맞고 틀림을 넘어, 틀린 이유를 논리적으로 정리한다.",
  "어려운 과목이나 숙제라도 미루지 않고 정해진 시간에 바로 시작한다.",
  "하루 목표가 '수학 1시간'이 아니라 '수학 20문제'처럼 분량 단위로 구체적이다.",
  "컨디션이 좋지 않거나 기분이 안 좋아도 정해진 최소한의 공부는 해낸다.",
  "비슷한 유형의 실수를 반복하지 않기 위해 나만의 오답 체크 기준이 있다.",
  "공부를 시작하기 전, 해야 할 양에 압도당하지 않고 차분하게 임한다.",
  "과목의 특성(암기, 이해, 응용)에 따라 공부하는 방식이 다르다.",
  "책상에 앉아서 스마트폰을 보거나 딴짓을 하며 시간을 끄는 편이 아니다.",
  "복습할 때 단순히 다시 읽기보다 스스로 테스트하거나 백지에 써본다.",
  "공부 중 흐름이 끊겨도(전화, 휴식 등) 다시 집중 상태로 빠르게 복귀한다.",
  "공부를 마친 후, 오늘 새롭게 알게 된 핵심 내용을 머릿속으로 요약해본다.",
  "하루 전체의 학습 리듬이 중간에 무너지지 않고 끝까지 유지된다.",
  "공부한 내용을 남에게 설명하거나 스스로에게 가르치듯 정리할 수 있다.",
  "새로운 단원이나 어려운 숙제를 마주했을 때 심리적 거부감이 적은 편이다.",
  "계획을 세울 때 가용 시간과 공부 양의 밸런스를 잘 조절한다.",
  "계획이 어긋나더라도 포기하지 않고 그날 안에서 유연하게 조정한다.",
  "무작정 많이 풀기보다 효율적인 풀이법이나 개념의 원리를 고민한다.",
  "정해진 공부 시간이 되면 별도의 도움 없이도 즉시 책상을 펴고 앉는다."
];

const domains = { A: [1, 5, 9, 13, 17], B: [2, 6, 10, 14, 18], C: [3, 7, 11, 15, 19], D: [4, 8, 12, 16, 20] };

const domainExplanations = {
  A: { 
    high: "목표를 구체화하고 전체 학습 흐름을 짜는 구조화 능력이 탁월합니다. 본인의 현재 위치를 파악하고 효율적인 동선을 스스로 설계합니다.", 
    low: "계획보다는 기분이나 상황에 맞춰 즉흥적으로 공부하는 성향입니다. 뼈대 없이 단편적인 지식만 쌓일 수 있어 외부의 구조적 시스템이 필요합니다." 
  },
  B: { 
    high: "한 번 세운 계획을 밀어붙이는 실천력과 유지력이 매우 강합니다. 컨디션이나 유혹에 쉽게 흔들리지 않고 꾸준히 학습 리듬을 지켜냅니다.", 
    low: "학습 의지가 주변 환경이나 피로도에 민감하게 변동하여 잦은 이탈이 발생합니다. 집중력을 유지시켜 줄 밀착 관리와 통제가 효과적입니다." 
  },
  C: { 
    high: "단순 암기를 넘어 철저한 오답 분석과 자기 설명을 통해 본질적 원리를 파악하려 하며, 지식을 내 것으로 만드는 메타인지가 훌륭합니다.", 
    low: "투자 시간 대비 실질적 성과가 아쉬운 패턴을 보입니다. 무작정 풀기에 머물러 있어 치밀한 오답 정리와 약점 보완 전략 교정이 시급합니다." 
  },
  D: { 
    high: "공부 시작에 대한 심리적 저항이나 미루는 습관이 없습니다. 마음먹은 일을 즉각 행동으로 옮기는 추진력이 우수해 공백기 극복이 빠릅니다.", 
    low: "막연한 부담감이나 완벽주의 때문에 공부 착수 자체를 매우 힘들어합니다. 책상에 앉기까지의 진입 장벽을 낮출 가벼운 루틴 설정이 필요합니다." 
  }
};

const typeInfo: Record<string, any> = {
  "1111": { 
      name: "완성형 자기주도", 
      method: "인강", 
      desc: "학습 구조화, 실천, 전략, 착수 모든 영역의 밸런스가 완벽한 최상위권 상태입니다.", 
      reason: "모든 지표가 최상위권으로, 스스로 학습을 통제하고 약점을 보완할 수 있는 고도의 메타인지를 이미 갖추고 있기 때문입니다.",
      sol: "학원 등으로 이동하는 불필요한 낭비를 줄이고, 인터넷 강의를 통해 스스로 생각하며 공부 시간을 최대치로 활용하는 것이 가장 효율적입니다.", 
      features: ["학습 구조화 능력 탁월", "실천력과 유지력 우수", "전략적 복습 체계 보유", "착수 저항 제로"] 
  },
  "1110": { 
      name: "시작 부담 우수자", 
      method: "학원 (대형)", 
      desc: "기본 실력과 공부 전략은 좋으나, 공부를 시작하기 전 심리적 압박감을 크게 느낍니다.", 
      reason: "실력은 충분하나 시작 전 압박감으로 시간 누수가 발생하므로, 정해진 시간에 의무적으로 착수하게 만드는 외부 스케줄이 필요하기 때문입니다.",
      sol: "수업 난이도가 높아도 잘 따라갈 능력이 있습니다. 대형 학원의 시스템과 시간표를 통해 '일단 책상에 앉는' 강제성만 부여해 주세요.", 
      features: ["학업성취도 높음", "완벽주의 성향 가능성", "시작 전 압박감이 큼"] 
  },
  "1101": { 
      name: "전략 보완형", 
      method: "학원 (소형)", 
      desc: "계획적이고 꾸준히 노력하지만, 공부하는 방법에 질적인 효율성이 떨어집니다.", 
      reason: "성실함과 실행력은 뛰어나지만 잘못된 방법(양치기 등)으로 에너지를 소모하고 있어, 전문가의 날카로운 피드백이 시급하기 때문입니다.",
      sol: "대형보다는 선생님의 관심 속에서 집중 케어가 가능한 소형 학원에서 잘못된 문제 접근법과 공부 효율성을 즉각적으로 교정받아야 합니다.", 
      features: ["학습량은 충분함", "방법론적 효율 부족", "양치기 공부 성향"] 
  },
  "1100": { 
      name: "비효율 착수부담형", 
      method: "학원 (소형)", 
      desc: "하려는 의지는 있으나 어디서부터 어떻게 시작해야 할지 몰라 막막한 상태입니다.", 
      reason: "의지는 충만하나 방법도 모르고 시작의 두려움도 커서, 선생님의 세심한 가이드와 따뜻한 환경이 동시에 제공되어야 하기 때문입니다.",
      sol: "개인적으로 챙겨주는 소형 학원이 좋습니다. 소수정예 분위기 속에서 꼼꼼한 공부 가이드를 받으며 착수 거부감을 점진적으로 줄여나가세요.", 
      features: ["실행 의지는 있으나 막막함", "전략 부재로 인한 정체기"] 
  },
  "1011": { 
      name: "실행 보완형", 
      method: "과외", 
      desc: "이론적인 공부법과 계획은 잘 알지만, 막상 끈기 있게 실천하는 힘이 부족합니다.", 
      reason: "공부법은 아나 끈기가 부족하여 잦은 이탈이 발생하므로, 매일의 학습량을 점검하고 텐션을 강제로 유지해 줄 러닝메이트가 필수적이기 때문입니다.",
      sol: "혼자 두면 마무리가 안 됩니다. 1대1 밀착 과외를 통해 그날의 진도와 이해도를 즉시 피드백 받으며 실행력을 끝까지 끌어올려야 합니다.", 
      features: ["공부법 지식은 풍부", "뒷심과 끈기 부족", "외부 자극에 민감함"] 
  },
  "1010": { 
      name: "실행/착수 보완형", 
      method: "과외", 
      desc: "스스로 공부를 시작하기도 어렵고, 기껏 시작해도 금방 다른 길로 샙니다.", 
      reason: "혼자 두면 아예 시작을 못하거나 금방 집중력을 잃기 때문에, 옆에서 시작을 열어주고 끝날 때까지 밀착 감시/독려해 줄 사람이 필요하기 때문입니다.",
      sol: "시작부터 유지까지 전면적 도움이 필요합니다. 1대1 과외를 통해 모르는 부분을 즉각 해소하며 선생님과 페이스를 강제로 맞추는 과정이 필수입니다.", 
      features: ["혼자 있으면 딴짓 다수", "착수와 유지 모두 외부 도움 필요"] 
  },
  "1001": { 
      name: "계획만 거창형", 
      method: "관리형 독서실", 
      desc: "플래너 꾸미기나 거창한 계획에 몰두하지만, 실질적인 실천과 성과가 없습니다.", 
      reason: "계획 세우기에만 에너지를 쓰고 실제 학습으론 이어지지 않는 몽상가적 기질이 있어, 물리적으로 딴짓을 차단하는 환경 통제가 가장 효과적이기 때문입니다.",
      sol: "강의보다는 환경적 통제가 시급합니다. 관리형 독서실에 입소하여 스마트폰 제출 및 순수 자습 시간 자체를 반강제적으로 확보하는 것이 최우선입니다.", 
      features: ["보여주기식 공부 위험", "실질 학습 데이터 부족", "강력한 환경 통제 필요"] 
  },
  "1000": { 
      name: "고위험 실행저항형", 
      method: "과외", 
      desc: "공부에 대한 거부감이 매우 크고, 책상에 앉아 유지하는 기초 체력이 부족합니다.", 
      reason: "학습에 대한 무기력과 기초 체력 부재가 심각하여, 학원의 진도 수업보다는 1:1로 정서적 교감과 아주 작은 성공 경험을 쌓는 것이 우선이기 때문입니다.",
      sol: "학원 속도를 따라갈 수 없습니다. 1대1 밀착 과외로 부끄럼 없이 기초부터 질문하고, 즉각적인 피드백을 받으며 작은 성취부터 조심스레 쌓아가야 합니다.", 
      features: ["학습 무기력 상태 의심", "기초 체력 부족", "심리적 케어가 최우선"] 
  },
  "0111": { 
      name: "감각형 실전형", 
      method: "인강", 
      desc: "즉흥적 실천력은 좋으나 전체적인 틀이 없어 학습 누수가 발생하기 쉽습니다.", 
      reason: "실천력과 이해도는 훌륭하지만 공부의 뼈대가 없어 지식이 파편화되므로, 인강으로 체계를 촘촘히 잡고 스스로 구조를 세우는 방식이 유리하기 때문입니다.",
      sol: "학원 이동시간 등 불필요한 낭비를 줄이고, 혼자서 인터넷 강의를 듣고 구조를 세우며 효율적으로 공부 시간을 활용하는 것이 성과가 훨씬 좋습니다.", 
      features: ["실전 감각 우수", "체계적인 정리 미흡", "기분파 공부 성향"] 
  },
  "0110": { 
      name: "기복형 실전형", 
      method: "학원 (대형)", 
      desc: "기본 실력은 있으나 감정과 컨디션에 따라 공부 양과 집중력의 편차가 심합니다.", 
      reason: "컨디션에 따른 밸런스 붕괴가 심하므로, 본인의 기분과 무관하게 흔들림 없이 진도를 강제로 견인해 줄 탄탄한 대형 시스템이 버팀목이 되어야 하기 때문입니다.",
      sol: "컨디션이 안 좋아도 반강제적으로 진도를 나갈 수 있어야 합니다. 퀄리티 높은 대형 학원 시스템에 몸을 맡겨 개인의 기복을 최소화하세요.", 
      features: ["감정 기복에 매우 취약", "특정 과목 편식 위험"] 
  },
  "0101": { 
      name: "비체계 실행형", 
      method: "학원 (대형)", 
      desc: "누군가 시키는 것은 잘 해내지만, 자기만의 공부 철학이나 주도성이 부족합니다.", 
      reason: "스스로 분석하는 주도성은 약하지만 주어진 과제는 묵묵히 해내는 수동적 성실함이 강해, 전문가가 잘 짜놓은 커리큘럼과 시너지가 가장 좋기 때문입니다.",
      sol: "어려운 과제라도 성실하게 잘 따라갈 수 있습니다. 대형 학원의 난이도 있는 커리큘럼에 탑승하여 남은 빈틈을 본인만의 노력으로 채우도록 하세요.", 
      features: ["수동적 우수성", "자기만의 전략 부재", "가이드라인에 의존"] 
  },
  "0100": { 
      name: "양치기 비효율형", 
      method: "학원 (소형)", 
      desc: "기계적으로 문제집만 많이 풀 뿐, 왜 틀렸는지 분석하지 않아 성적이 멈춰 있습니다.", 
      reason: "맹목적인 문제 풀이로 성적이 정체된 상태이므로, 진도 위주의 대형 강의보다는 소형 학원의 밀착 질문 피드백을 통한 질적 성장이 우선이기 때문입니다.",
      sol: "대형 학원에서는 약점이 방치됩니다. 선생님이 꼼꼼히 봐주는 소형 학원에서 질문과 피드백을 거치며 효율적이고 논리적인 문제 접근법을 배워야 합니다.", 
      features: ["학습량 대비 성과 저조", "고정관념이 강한 공부법"] 
  },
  "0011": { 
      name: "전략적 게으름형", 
      method: "과외", 
      desc: "이론적인 공부법과 계획은 잘 알지만, 막상 끈기 있게 실천하는 힘이 부족합니다.", 
      reason: "두뇌 회전은 빠르나 노력의 가치를 폄하하고 실행하지 않으므로, 롤모델이 될 만한 과외 선생님을 통해 지적 자극과 강력한 동기를 부여해야 하기 때문입니다.",
      sol: "일반 수업으론 집중하지 않습니다. 1대1 밀착 과외를 통해 학습의 텐션과 지적 호기심을 불어넣어 줄 수 있는 카리스마 있는 선생님이 반드시 필요합니다.", 
      features: ["빠른 이해도", "노력 가치 저평가", "강력한 동기부여 필요"] 
  },
  "0010": { 
      name: "생각 많은 전략가", 
      method: "과외", 
      desc: "모든 것을 완벽히 준비하고 이해해야 시작하려 하므로 진입 장벽이 너무 높습니다.", 
      reason: "완벽주의 성향으로 실행 단계에서의 병목이 심각하므로, 불완전하더라도 일단 시작하게 만들고 막히는 부분을 즉각 해소해 줄 밀착 코칭이 필요하기 때문입니다.",
      sol: "막히면 시작조차 못 합니다. 1대1 밀착 과외를 통해 모르는 부분을 즉각적으로 해결해주고, 진도를 억지로라도 빼주며 실천의 문턱을 낮추는 과정이 필수입니다.", 
      features: ["완벽주의로 인한 지연", "실행 단계 병목 현상"] 
  },
  "0001": { 
      name: "기초 부실 실행형", 
      method: "과외", 
      desc: "공부 경험치 자체가 절대적으로 부족하여 어디서부터 손을 대야 할지 모릅니다.", 
      reason: "기초 지식뿐만 아니라 '공부하는 방법' 자체를 전혀 모르므로, 학원 진도보다는 전 과목을 아우르며 세세한 학습 습관까지 1:1로 교정해야 하기 때문입니다.",
      sol: "학원 진도를 따라갈 수 없습니다. 1대1 밀착 과외를 통해 모르는 기초 개념을 부끄럼 없이 묻고 피드백 받으며, 개인별 세부 진도 체크를 꼼꼼히 받아야 합니다.", 
      features: ["학습 경험 매우 낮음", "전 과목/영역 가이드 필요"] 
  },
  "0000": { 
      name: "전면 재설계형", 
      method: "과외", 
      desc: "학습 의지와 기초 습관이 무너진 상태로, 근본적인 체질 개선이 시급합니다.", 
      reason: "학습 의지와 전략이 모두 백지상태에 가까워 섣부른 학원 수강은 거부감만 키우므로, 1:1 초밀착 과외를 통한 완전한 체질 개선 작업이 급선무이기 때문입니다.",
      sol: "환경의 완전한 통제가 필요합니다. 1대1 과외를 통해 세부 성향과 약점을 파악하고, 모르는 부분을 교정받으며 백지상태에서 아주 조금씩 다시 시작해야 합니다.", 
      features: ["의지 소멸 상태", "전 영역 취약", "기초 습관 완전 부재"] 
  }
};

export default function DiagnosisPage() {
  const [activeTab, setActiveTab] = useState<'questionnaire' | 'evaluation'>('questionnaire');
  const [studentInfo, setStudentInfo] = useState({ name: '', grade: '', date: new Date().toISOString().split('T')[0] });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const syncInfo = (field: string, value: string) => {
    setStudentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (qNum: number, value: string) => {
    let numVal = parseInt(value);
    if (isNaN(numVal)) {
      const newAnswers = { ...answers };
      delete newAnswers[qNum];
      setAnswers(newAnswers);
      return;
    }
    if (numVal > 5) numVal = 5;
    if (numVal < 1) numVal = 1;
    
    setAnswers(prev => ({ ...prev, [qNum]: numVal }));
  };

  const executeReset = () => {
    setStudentInfo({ name: '', grade: '', date: new Date().toISOString().split('T')[0] });
    setAnswers({});
    setReportData(null);
    setShowConfirmModal(false);
    showMessage("모든 내용이 초기화되었습니다.");
  };

  const generateReport = () => {
    const scores = { A: 0, B: 0, C: 0, D: 0 };
    let allFilled = true;

    for (let d in domains) {
      domains[d as keyof typeof domains].forEach(num => {
        if (!answers[num]) {
          allFilled = false;
        } else {
          scores[d as keyof typeof scores] += answers[num];
        }
      });
    }

    if (!allFilled) {
      showMessage("모든 점수를 입력해 주세요.");
      return;
    }

    let typeCode = "";
    for (let d in scores) {
      typeCode += scores[d as keyof typeof scores] >= 15 ? "1" : "0";
    }

    const typeDetails = typeInfo[typeCode] || typeInfo["0000"];

    setReportData({
      scores,
      typeCode,
      details: typeDetails
    });

    setTimeout(() => {
      document.getElementById('reportArea')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (reportData && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new ChartJS(ctx, {
          type: 'radar',
          data: {
              labels: ['구조(A)', '실행(B)', '전략(C)', '착수(D)'],
              datasets: [{
                  data: [reportData.scores.A, reportData.scores.B, reportData.scores.C, reportData.scores.D],
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  borderColor: 'rgba(37, 99, 235, 0.8)',
                  borderWidth: 2,
                  pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1.5,
                  pointRadius: 3.5
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              scales: { 
                  r: { 
                      min: 0, 
                      max: 25, 
                      ticks: { display: false, stepSize: 5 },
                      grid: { color: 'rgba(0,0,0,0.05)' },
                      angleLines: { color: 'rgba(0,0,0,0.05)' },
                      pointLabels: { font: { size: 10, weight: 'bold' }, color: '#64748b' } 
                  } 
              },
              plugins: { legend: { display: false } }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-64px)] pb-20 font-sans relative">
      
      {/* Alert Message */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold border border-slate-700 animate-in slide-in-from-top-4">
          <span>{message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">초기화 확인</h3>
            <p className="text-sm text-slate-600 mb-6">입력된 모든 점수와 개인정보가 초기화됩니다.<br/>계속하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors">취소</button>
              <button onClick={executeReset} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">초기화</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto pt-8 px-4 print:hidden mb-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => setActiveTab('questionnaire')} 
            className={`font-bold py-3 px-8 rounded-xl border-2 transition-all shadow-sm flex items-center justify-center ${activeTab === 'questionnaire' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <span className="mr-2">📝</span> 1. 학생용 문항지 입력/인쇄
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')} 
            className={`font-bold py-3 px-8 rounded-xl border-2 transition-all shadow-sm flex items-center justify-center ${activeTab === 'evaluation' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <span className="mr-2">💻</span> 2. 결과 확인 및 분석
          </button>
        </div>
      </div>

      {/* VIEW 1: Questionnaire */}
      {activeTab === 'questionnaire' && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-4 mb-6 print:hidden">
            <button onClick={() => setShowConfirmModal(true)} className="bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl hover:bg-slate-300 transition-all shadow-sm flex items-center justify-center">
              <span className="mr-2">🔄</span> 초기화
            </button>
            <button onClick={handlePrint} className="bg-slate-800 text-white font-bold py-3.5 px-10 rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center">
              <span className="mr-2">🖨️</span> 문항지 인쇄 (PDF)
            </button>
          </div>

          <div className="flex justify-center bg-transparent">
            <div className="bg-white p-8 md:p-[40px] w-full max-w-[794px] min-h-[1120px] shadow-2xl rounded-2xl print:shadow-none print:rounded-none print:w-full">
              <div className="text-center mb-5">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold mb-2 uppercase tracking-widest border border-slate-200">Student Questionnaire</div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">학습 성향 진단 검사지</h1>
                <div className="h-1 w-16 bg-slate-800 mx-auto rounded-full mb-4"></div>
                
                <div className="flex justify-center gap-6 text-sm font-bold text-slate-700 mt-2">
                  <div className="flex items-center">학교/학년 <input type="text" value={studentInfo.grade} onChange={(e) => syncInfo('grade', e.target.value)} className="w-24 border-b border-slate-400 ml-2 h-5 bg-transparent focus:outline-none text-center text-blue-700" /></div>
                  <div className="flex items-center">이름 <input type="text" value={studentInfo.name} onChange={(e) => syncInfo('name', e.target.value)} className="w-20 border-b border-slate-400 ml-2 h-5 bg-transparent focus:outline-none text-center text-blue-700" /></div>
                  <div className="flex items-center">검사일 <input type="date" value={studentInfo.date} onChange={(e) => syncInfo('date', e.target.value)} className="w-28 border-b border-slate-400 ml-2 h-5 bg-transparent focus:outline-none text-center text-xs text-blue-700" style={{ cssText: '::-webkit-calendar-picker-indicator { display: none; }' } as any} /></div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4">
                <p className="text-[12px] text-blue-900 font-medium leading-relaxed flex items-start">
                  <span className="text-lg mr-2 leading-none">💡</span>
                  <span>아래 문항을 읽고, <strong>최근 2주간 자신의 실제 공부 모습과 가장 가까운 숫자</strong>에 체크 해주세요.<br/>
                  선택된 점수는 '결과 확인 및 분석' 탭에 자동 입력됩니다.</span>
                </p>
                <div className="mt-2 flex justify-between px-8 text-[10px] font-bold text-blue-700 bg-white py-1.5 rounded-lg border border-blue-100">
                  <span>(1) 매우 그렇지 않다</span>
                  <span>(2) 그렇지 않다</span>
                  <span>(3) 보통이다</span>
                  <span>(4) 그렇다</span>
                  <span>(5) 매우 그렇다</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="py-1.5 px-2 text-[11px] font-bold text-slate-500 w-10 text-center">NO</th>
                    <th className="py-1.5 px-2 text-[12px] font-bold text-slate-800">문항 내용</th>
                    {[1, 2, 3, 4, 5].map(num => (
                      <th key={num} className="py-1.5 px-1 text-[10px] font-bold text-slate-500 w-8 text-center">{num}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questionsText.map((qText, idx) => {
                    const qNum = idx + 1;
                    return (
                      <tr key={qNum} className={`${qNum % 2 === 0 ? 'bg-slate-50' : 'bg-white'} border-b border-slate-100`}>
                        <td className="py-1.5 px-2 text-[11px] font-bold text-blue-600 text-center">{qNum}</td>
                        <td className="py-1.5 px-2 text-[12px] text-slate-700 font-medium leading-tight cursor-pointer hover:text-blue-600" onClick={() => setActiveTab('evaluation')}>{qText}</td>
                        {[1, 2, 3, 4, 5].map(val => (
                          <td key={val} className="py-1.5 px-1 text-center cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => handleAnswerChange(qNum, val.toString())}>
                            <div className={`w-4 h-4 rounded-full border mx-auto text-[9px] flex items-center justify-center transition-colors font-bold ${answers[qNum] === val ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent'}`}>
                              {answers[qNum] === val ? 'V' : 'O'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pt-3 border-t border-slate-200 text-center mt-auto h-full flex flex-col justify-end">
                <p className="text-slate-400 text-[10px] font-medium">수고하셨습니다. 모든 문항을 완료한 후 [결과 확인 및 분석] 탭으로 이동하세요.</p>
                <p className="text-slate-300 text-[8px] mt-1 uppercase tracking-widest">Learning Style Analysis System v3.0 - Student Copy</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Evaluation */}
      {activeTab === 'evaluation' && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 pt-0 print:hidden">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">학교/학년</label>
                <input type="text" value={studentInfo.grade} onChange={(e) => syncInfo('grade', e.target.value)} className="w-full border-slate-200 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="예: 중2 / 예비고1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">학생 성명</label>
                <input type="text" value={studentInfo.name} onChange={(e) => syncInfo('name', e.target.value)} className="w-full border-slate-200 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="이름 입력" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">검사일</label>
                <input type="date" value={studentInfo.date} onChange={(e) => syncInfo('date', e.target.value)} className="w-full border-slate-200 rounded-xl shadow-sm border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <h2 className="text-lg font-bold text-slate-800">문항별 점수 입력</h2>
                <span className="text-xs text-slate-400 font-medium">문항지에서 선택된 값이 자동 연동됩니다. (직접 수정 가능)</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <div key={num} className={`flex flex-col p-2.5 rounded-2xl border transition-colors cursor-help ${!answers[num] ? 'bg-slate-50 border-slate-100' : 'bg-blue-50 border-blue-200'}`} title={questionsText[num-1]}>
                    <label className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">Q{num}</label>
                    <input 
                      type="number" 
                      min="1" max="5" 
                      value={answers[num] || ''} 
                      onChange={(e) => handleAnswerChange(num, e.target.value)}
                      className="bg-transparent text-lg font-bold text-slate-700 text-center focus:outline-none" 
                      placeholder="-" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <button onClick={() => setShowConfirmModal(true)} className="bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl hover:bg-slate-300 transition-all shadow-sm flex items-center justify-center">
                <span className="mr-2">🔄</span> 초기화
              </button>
              <button onClick={generateReport} className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                분석 결과 리포트 생성
              </button>
              <button onClick={handlePrint} disabled={!reportData} className={`text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg ${reportData ? 'bg-slate-800 hover:bg-black' : 'bg-slate-400 cursor-not-allowed'}`}>
                결과지 인쇄 (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Area (Visible when report generated OR when printing evaluation tab) */}
      {reportData && activeTab === 'evaluation' && (
        <div id="reportArea" className="max-w-4xl mx-auto px-4 pb-10">
          <div className="flex justify-center">
            <div className="bg-white p-8 md:p-[40px] w-full max-w-[794px] min-h-[1120px] shadow-2xl rounded-2xl print:shadow-none print:rounded-none print:w-full flex flex-col">
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold mb-2 uppercase tracking-widest border border-blue-100">Learning Style Analysis Report</div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">학습 성향 분석 결과지</h1>
                <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full mb-2"></div>
                <p className="text-base text-slate-700"><span className="font-bold text-blue-700">{studentInfo.name || "미지정 학생"}</span> 학생 성향 진단 결과</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">발행일: {studentInfo.date}</p>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-4 items-center">
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Learning Balance Chart</h4>
                  <div className="relative h-[170px] w-full">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>
                <div className="flex flex-col justify-center px-3">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full mr-2"></span>
                    핵심 지표 점수
                  </h3>
                  <div className="space-y-4">
                    {Object.entries({ A: "학습 구조", B: "실행 안정", C: "전략 효율", D: "착수 즉각" }).map(([key, label]) => {
                      const score = reportData.scores[key];
                      const isHigh = score >= 15;
                      return (
                        <div key={key} className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-bold text-slate-500">{label}</span>
                            <span className={`text-[11px] font-black ${isHigh ? 'text-blue-600' : 'text-slate-400'}`}>{score} / 25</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${(score / 25) * 100}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl mb-4 text-white shadow-lg flex flex-col items-center text-center">
                <span className="text-slate-400 text-[9px] font-semibold mb-1 uppercase tracking-widest">Diagnosis Results</span>
                <h3 className="text-xl font-black mb-1 text-blue-400">{reportData.details.name}</h3>
                <div className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full mb-2 shadow-inner border border-blue-500">💡 맞춤 추천: {reportData.details.method}</div>
                <div className="w-20 h-0.5 bg-white/20 mb-2"></div>
                <p className="text-slate-200 leading-relaxed text-[12px] max-w-xl break-keep">{reportData.details.desc}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-center">
                  <span className="mr-2">📝</span> 영역별 세부 분석 근거
                </h3>
                <div className="grid grid-cols-2 gap-2 px-1">
                  {Object.entries({ A: "학습 구조", B: "실행 안정", C: "전략 효율", D: "착수 즉각" }).map(([key, label]) => {
                    const isHigh = reportData.scores[key] >= 15;
                    const text = isHigh ? domainExplanations[key as keyof typeof domainExplanations].high : domainExplanations[key as keyof typeof domainExplanations].low;
                    return (
                      <div key={key} className={`p-3 rounded-2xl border flex flex-col items-start ${isHigh ? 'border-blue-100 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="flex items-center mb-1.5 w-full">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md mr-2 ${isHigh ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>{label}</span>
                          <span className="text-[12px] font-bold text-slate-800">{reportData.scores[key]}점</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug w-full text-left break-keep">{text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-center">
                  <h4 className="font-bold text-slate-800 mb-3 text-[13px] flex items-center"><span className="mr-2">💡</span> 주요 학습 특징 요약</h4>
                  <ul className="space-y-2">
                    {reportData.details.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start text-[11px] text-slate-600 font-medium">
                        <span className="text-blue-500 mr-2 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm flex flex-col justify-center">
                  <h4 className="font-bold text-blue-900 mb-2 text-[13px] flex items-center"><span className="mr-2">🎯</span> 전문가 맞춤 학습 처방</h4>
                  <div className="text-slate-700 leading-relaxed text-[11px] break-keep space-y-2">
                    <p className="mb-2"><strong className="text-blue-800">✅ 추천 이유:</strong> {reportData.details.reason}</p>
                    <p><strong className="text-blue-800">✅ 맞춤 처방:</strong> {reportData.details.sol}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-3 text-center">
                <div className="h-px w-full bg-slate-100 mb-2"></div>
                <p className="text-slate-400 text-[9px] font-medium">본 리포트는 진단 문항에 대한 학생의 응답을 바탕으로 한 객관적 분석 자료입니다.</p>
                <p className="text-slate-300 text-[8px] mt-0.5 uppercase tracking-widest">Learning Style Analysis System v3.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { max-w: none !important; }
          .pb-20 { padding-bottom: 0 !important; }
          .bg-slate-100 { background-color: white !important; }
        }
      `}} />
    </div>
  );
}