"use client";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import sha256 from "crypto-js/sha256";
import { useRouter } from "next/navigation";
import axios from "axios";

const Form = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const transactionid = "Tr-" + uuidv4().toString(36).slice(-6);

      const payload = {
        merchantId: process.env.NEXT_PUBLIC_MERCHANT_ID,
        merchantTransactionId: transactionid,
        merchantUserId: data.muid,
        amount: parseInt(data.amount) * 100, // amount in paise
        redirectUrl: `http://localhost:3000/api/status/${transactionid}`,
        redirectMode: "POST",
        callbackUrl: `http://localhost:3000/api/status/${transactionid}`,
        mobileNumber: data.mobile,
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      const dataPayload = JSON.stringify(payload);
      console.log("Data Payload:", dataPayload);

      const dataBase64 = btoa(dataPayload); // base64 encoding for browsers
      console.log("Data Base64:", dataBase64);

      const fullURL =
        dataBase64 + "/pg/v1/pay" + process.env.NEXT_PUBLIC_SALT_KEY;
      const dataSha256 = sha256(fullURL).toString();

      const checksum = dataSha256 + "###" + process.env.NEXT_PUBLIC_SALT_INDEX;
      console.log("Checksum:", checksum);

      const UAT_PAY_API_URL =
        "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

      const response = await axios.post(
        UAT_PAY_API_URL,
        {
          request: dataBase64,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
          },
        }
      );

      if (response.data.success) {
        const redirect = response.data.data.instrumentResponse.redirectInfo.url;
        router.push(redirect);
      } else {
        console.error("Payment failed:", response.data);
      }
    } catch (error) {
      console.error("Error during payment process:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 p-5 md:w-1/2"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            {...register("name", { required: true })}
            id="name"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.name && (
            <span className="text-red-500">Name is required</span>
          )}
        </div>
        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700"
          >
            Mobile
          </label>
          <input
            {...register("mobile", { required: true })}
            id="mobile"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.mobile && (
            <span className="text-red-500">Mobile is required</span>
          )}
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount (INR)
          </label>
          <input
            {...register("amount", { required: true })}
            id="amount"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.amount && (
            <span className="text-red-500">Amount is required</span>
          )}
        </div>
        <div>
          <label
            htmlFor="muid"
            className="block text-sm font-medium text-gray-700"
          >
            MUID
          </label>
          <input
            {...register("muid", { required: true })}
            id="muid"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.muid && (
            <span className="text-red-500">MUID is required</span>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Pay
        </button>
      </form>
    </div>
  );
};

export default Form;
