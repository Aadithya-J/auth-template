import Button from "./Button";
import { useNavigate } from "react-router-dom";
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg";
import speak from "../assets/s.jpg";
import PropTypes from 'prop-types';

const TakeTestCard = ({ test, buttonLabel }) => {
  const navigate = useNavigate();
  const getImageForTest = (id) => {
    if (id === 1) {
      return mag;
    }
    if (id === 2) {
      return speak;
    }
    if (id === 3) {
      return books;
    }
    if(id === 5){
      return speak;
    }
    return books;
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    localStorage.setItem("selectedTestId", test.id);
    navigate("/selectstudent");
  };

  return (
    <div className="pb-3 pt-4">
      {" "}
      {/* Added padding at the top to prevent clipping */}
      <div className="relative w-full h-[290px] group bg-black rounded-xl overflow-visible">
        {" "}
        {/* Use overflow-visible to ensure nothing is clipped */}
        <div className="relative z-10 group">
          <article className="w-full h-[290px] flex border-2 border-black rounded-xl bg-[#fafafa] text-black transition-all duration-300 ease-out transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_rgba(0,0,0,0.7)] group-hover:border-black">
            <figure className="w-[30%] h-full border-black border-r-2">
              <img
                src={getImageForTest(test.id)}
                alt="thumbnail"
                className="w-full h-full object-cover rounded-l-xl"
              />
            </figure>
            <div className="px-4 group-hover:bg-[#ff937a] py-3 text-left w-[70%] flex flex-col justify-center rounded-r-xl">
              <h1 className="text-[24px] mb-[0.5] pl-5 font-bold font-roboto">
                {test.testName}
              </h1>
              <div className="flex pt-3 items-center pl-5 space-x-2">
                <h2 className="text-[16px] pr-5 font-roboto text-gray-500 group-hover:text-black">
                  {test.About}
                </h2>
              </div>
              <div className="w-[100%] h-[65px] flex justify-end rounded-md pt-5 pr-5">
                <Button label={buttonLabel} onClick={handleButtonClick} />
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

TakeTestCard.propTypes = {
  test: PropTypes.shape({
    id: PropTypes.number.isRequired,
    testName: PropTypes.string.isRequired,
    About: PropTypes.string.isRequired
  }).isRequired,
  buttonLabel: PropTypes.string.isRequired
};

export default TakeTestCard;
