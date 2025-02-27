import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PersonalDetails() {
  // Removed "email" from the initial state
  const [details, setDetails] = useState({
    username: '',
    primaryContact: '',
    secondaryContacts: ['']
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Simple validation (expand as needed)
  const validate = () => {
    const newErrors = {};
    // Add any validation logic here if needed.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactChange = (index, newValue) => {
    const updatedContacts = [...details.secondaryContacts];
    updatedContacts[index] = newValue;
    setDetails({ ...details, secondaryContacts: updatedContacts });
  };

  const addNewContact = () => {
    setDetails({ ...details, secondaryContacts: [...details.secondaryContacts, ""] });
  };

  const removeContact = (index) => {
    if (details.secondaryContacts.length === 1) return;
    const updatedContacts = details.secondaryContacts.filter((_, i) => i !== index);
    setDetails({ ...details, secondaryContacts: updatedContacts });
  };

  const updatePersonalDetails = async () => {
    try {
      console.log('Submitted details:', details);

      // Payload now uses primaryContactEmail and contactEmail from the fields
      const payload = {
        username: details.username,
        primaryContactEmail: details.primaryContact,
        contactEmail: details.secondaryContacts.join(',')
      };

      const response = await fetch('http://localhost:8080/update-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Update failed. Please try again.');
      }

      const textResponse = await response.text();
      console.log('Update response:', textResponse);
      setMessage(textResponse);

    } catch (err) {
      console.log('Update error:', err);
      setMessage('Update failed. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (validate()) {
      updatePersonalDetails();
    }
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#FAFAFA]`}>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black border border-gray-300 space-y-2">
          <img src="https://i.postimg.cc/VsRBMLgn/pglogo.png" className="w-40" alt="logo" />
          <p className="font-bold text-2xl">Personal Details</p>

          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={details.username}
              onChange={(e) => setDetails({ ...details, username: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
            />
            {errors.username && <div className="text-red-500">{errors.username}</div>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="primaryContact">Primary Email</label>
            <input
              type="text"
              id="primaryContact"
              name="primaryContact"
              value={details.primaryContact}
              onChange={(e) => setDetails({ ...details, primaryContact: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
            />
            {errors.primaryContact && <div className="text-red-500">{errors.primaryContact}</div>}
          </div>

          <div className="flex flex-col">
            <div className="space-x-2">
              <label htmlFor="secondaryContacts">Secondary Contact Emails</label>
              <button
                onClick={addNewContact}
                type="button"
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                +
              </button>
            </div>
            {details.secondaryContacts.map((contact, index) => (
              <div key={index} className="mb-2 flex items-center">
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => handleContactChange(index, e.target.value)}
                  className="border-gray-600 border rounded-lg p-1 flex-1 mr-2"
                />
                {details.secondaryContacts.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    -
                  </button>
                ) : (
                  <div className="bg-gray-500 text-white px-2 py-1 rounded">-</div>
                )}
              </div>
            ))}
            {errors.secondaryContacts && <div className="text-red-500">{errors.secondaryContacts}</div>}
          </div>

          <button className="bg-[#00A9C5] text-white rounded-full py-1 px-8" type="submit">
            Update
          </button>
          {message && <div className="text-red-500">{message}</div>}
        </form>
      </main>
    </div>
  );
}
