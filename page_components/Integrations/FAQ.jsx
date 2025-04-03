import { useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQ = ({ faqs }) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleAccordion = (index) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-white font-bold text-4xl">FAQ</h1>
      </div>

      <div className="flex flex-col gap-8">
        {faqs.map((faq, index) => (
          <div key={index}>
            <div
              className="accordion-header"
              style={{
                cursor: "pointer",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(25, 32, 95, 1)",
              }}
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-white text-lg font-semibold">
                {faq.question}
              </h3>
              {openIndexes.includes(index) ? (
                <ExpandLessIcon sx={{ color: "#00b8ff" }} />
              ) : (
                <ExpandMoreIcon sx={{ color: "#00b8ff" }} />
              )}
            </div>
            {openIndexes.includes(index) && (
              <div className="accordion-content" style={{ minHeight: "50px" }}>
                <p className="text-[#9f9f9f] text-md">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
