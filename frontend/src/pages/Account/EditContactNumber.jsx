import { useState, useEffect } from 'react';

import { Link, useParams, useNavigate } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { request } from '../../utils/axios';
import { statusCategory,userTypeCategory } from '../../utils/categories';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { AiOutlineCloseCircle, AiOutlineArrowRight } from 'react-icons/ai';

import Navbar from '../../components/Navbar';

const AccountInput = ({ type }) => {

  const navigate = useNavigate();

  const { token,user } = useSelector((state) => state.auth);

  const [contactNumber, setContactNumber] = useState('');
   
    
  useEffect(() => {
    console.log(user);

      const fetchAccountDetails = async () => {
        try {
          const options = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          };
          const data = await request(`/auth/${user.id}`, 'GET', options);
console.log(data);
        
          setContactNumber(data.contactNumber);
    
      
        } catch (error) {
          console.error(error);
        }
      };
      fetchAccountDetails();
    
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const options = {     'Content-Type': 'application/json', Authorization: `Bearer ${token}`,};
      const data = await request(`/auth/update/contact-number`, 'PUT',options, {contactNumber});
      const { success, message } = data;
   console.log(data);

      if(success) {
     
        toast.success(message);
       
     return; 
    }
    else {
      if(message != "input error") {
        toast.success(message);
      }  else {
    
      }
    } }catch (error) {
      console.error(error);
    }
  };



  return (
    <>
      <Navbar />
      <div>
        <div>
           
         
          <h2>Update Personal Information</h2>
          <form onSubmit={handleSubmit}>
         
          <input
            type="text"
            placeholder="Contact Number..."
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          
            
          
            <div>
            
                
              <button type="submit">Submit</button>
            </div>
          </form>
      
        </div>
      </div>
    </>
  );
};

export default AccountInput;
