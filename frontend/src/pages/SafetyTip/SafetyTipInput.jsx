import { useState, useEffect } from "react";

import { Link, useParams, useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { request } from "../../utils/axios";
import { safetyTipsCategory } from "../../utils/categories";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AiOutlineCloseCircle } from "react-icons/ai";

import Navbar from "../../components/Navbar";

const SafetyTipInput = ({ type }) => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (type === "update") {
      const fetchSafetyTipDetails = async () => {
        try {
          const options = {
            Authorization: `Bearer ${token}`,
          };
          const data = await request(`/safety-tips/${id}`, "GET", options);

          setTitle(data.title);
          setContent(data.content);
          setStatus(data.status);
          setCategory(data.category);
          setImageUrl(
            `https://res.cloudinary.com/dantwvqrv/image/upload/v1687689617/sagip/media/safety-tips/${data.image}`
          );
          console.log(data.category);
          console.log(category);
        } catch (error) {
          console.error(error);
        }
      };
      fetchSafetyTipDetails();
    }
  }, [type, setTitle, setContent, setCategory, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("hasChanged", hasChanged);
      formData.append("status", status);
      formData.append("image", image);

      let url, method;
      if (type === "add") {
        url = "/safety-tips/add";
        method = "POST";
      } else if (type === "update") {
        url = `/safety-tips/update/${id}`;
        method = "PUT";
      }

      const data = await request(
        url,
        method,
        {
          Authorization: `Bearer ${token}`,
        },
        formData
      );
      console.log(data);

      const { success, message } = data;
      if (success) {
        toast.success(message);
        /*  navigate(
          `/manage/safety-tips/${type === "add" ? data.safetyTip._id : id}`
        ); */
      } else {
        if (message !== "input error") {
          toast.error(message);
        } else {
          toast.error(message);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeFile = (e) => {
    setImage(e.target.files[0]);
    setImageName(e.target.files[0].name);
    setHasChanged(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleCloseImage = () => {
    setImage(null);
    hasChanged(false);
    setImageName("");
    setImageUrl("");
  };

  return (
    <>
      <Navbar />
      <div>
        <div>
          <Link to="/manage/safety-tips">Go Back</Link>
          <h2>{type === "add" ? "Add" : "Update"} Safety Tip</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div>
              <label>Title: </label>
              <input
                type="text"
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label>Description: </label>
              <ReactQuill
                value={content}
                onChange={setContent}
                readOnly={false}
                theme="snow"
              />
            </div>
            <div>
              <label>Content: </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" hidden>
                  Select a category
                </option>
                {safetyTipsCategory.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="" hidden>
                  Select a category
                </option>

                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </div>
            <div>
              <label htmlFor="image">
                Image: <span>Upload here</span>
              </label>
              <input id="image" type="file" onChange={onChangeFile} />
              {image && (
                <p>
                  {imageName}{" "}
                  <AiOutlineCloseCircle onClick={() => handleCloseImage()} />
                </p>
              )}
              {imageUrl && <img src={imageUrl} alt="Selected" />}
            </div>
            <div>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SafetyTipInput;
