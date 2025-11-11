import React, { useEffect, useState } from "react";
import { getExamQuestions, submitExam } from "../../api/studentExams";
import { useNavigate, useParams } from "react-router-dom";
import useExamTimer from "../../hooks/useExamTimer";
import useFullscreenExam from "../../hooks/useFullscreenExam";
import ExamQuestionCard from "../../components/Student/Exams/ExamQuestionCard";
import { getAuthToken, setAuthToken } from "../../api";

export default function ExamTakingPage() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { formatted, secondsLeft } = useExamTimer(30, handleAutoSubmit);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreenExam();

  // ✅ Auth check helper
  const ensureAuth = () => {
    const token = getAuthToken();
    if (!token) {
      alert("⚠️ Session expired. Please log in again.");
      navigate("/login");
      return false;
    }
    setAuthToken(token);
    return true;
  };

  // ✅ Auto-load questions and enter fullscreen once
  useEffect(() => {
    async function loadQuestions() {
      try {
        if (!ensureAuth()) return;
        const data = await getExamQuestions(examId);
        setQuestions(data);
      } catch (err) {
        console.error("❌ Failed to load questions:", err);
        alert(err?.response?.data?.message || "Failed to load exam questions");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [examId]);

  // ✅ Auto-enter fullscreen when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 500); // small delay ensures DOM ready
    return () => clearTimeout(timer);
  }, [enterFullscreen]);

  const handleSelect = (qid, opt) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit the exam?")) return;
    await performSubmit();
  };

  async function handleAutoSubmit() {
    alert("⏰ Time’s up! Submitting automatically...");
    await performSubmit();
  }

  const performSubmit = async () => {
    try {
      if (!ensureAuth()) return;

      const payload = {
        answers: questions.map((q, idx) => {
          const qid = q.id || q._id || q.questionId || `q-${idx}`;
          const selected = answers[qid];
          return {
            questionId: qid,
            selectedOption: selected ? `Option${selected}` : null,
          };
        }),
      };

      console.log("📤 Submitting payload:", payload);

      await submitExam(examId, payload);
      exitFullscreen();
      alert("🎉 Exam submitted successfully!");
      navigate(`/student/exams/result/${examId}`);
    } catch (err) {
      console.error("❌ Exam submission failed:", err);
      alert(err?.response?.data?.message || "Submission failed");
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading exam...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">🧠 Exam In Progress</h2>
        <div
          className={`text-lg font-semibold ${
            secondsLeft <= 60 ? "text-red-600" : "text-blue-600"
          }`}
        >
          ⏱ {formatted}
        </div>
      </div>

      {/* 🚫 Removed manual fullscreen button — it now enters automatically */}

      <div>
        {questions.map((q, idx) => {
          const qid = q.id || q._id || q.questionId || `q-${idx}`;
          return (
            <ExamQuestionCard
              key={qid}
              question={q}
              index={idx}
              selected={answers[qid]}
              onSelect={(opt) => handleSelect(qid, opt)}
            />
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          🚀 Submit Exam
        </button>
      </div>
    </div>
  );
}
