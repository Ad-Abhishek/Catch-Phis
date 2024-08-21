import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastUtil } from '../../../util/ToastUtil';
import Spinner from '../../../util/Spinner';
import Header from '../../../layout/Header';
import ErrorMessage from '../../../util/ErrorMessage';
import { Link } from 'react-router-dom';

const ActivateAccount = () => {
  const serverUrl = process.env.REACT_APP_CATCHPHIS_SERVER_URL;

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const [errors, setErrors] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors('');

    try {
      const body = {
        token: otp,
      };
      const response = await axios.post(
        `${serverUrl}/api/user/profile/activate/`,
        body
      );
      if (response.data) {
        localStorage.removeItem('token');
        ToastUtil.displaySuccessToast('Activation Success!');
        navigate('/users/login');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors('Token: ' + error.response.data.error);
      } else {
        setErrors('An error occurred. Please try again.');
      }
      ToastUtil.displayErrorToast('Activation Failed!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Spinner />}

      <Header heading={'Catch-Phis Activate Account'} color={'text-success'} />

      <div className="container mt-5">
        <div className="row">
          <div className="col-sm-4">
            <form onSubmit={handleSubmit}>
              <div className="m-2">
                <input
                  type="number"
                  value={otp}
                  className="form-control"
                  placeholder="Enter OTP"
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="m-2">
                <input
                  type="submit"
                  className="btn btn-success"
                  value="Activate"
                />
              </div>
            </form>
          </div>
          <div className="col-sm-4">
            {errors && <ErrorMessage message={errors} />}
          </div>
        </div>
      </div>

      <Link to={`/`} className="btn btn-warning">
        <i className="bi bi-arrow-left-circle m-2"></i>Back
      </Link>
    </>
  );
};
export default ActivateAccount;
