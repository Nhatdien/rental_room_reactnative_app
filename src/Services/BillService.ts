import apiClient from "../lib/apiClient";
import { Bill } from "../types/types";
import { API_URL } from "./Constants";
import AsyncStorage from "@react-native-async-storage/async-storage";


async function getAuthData() {
  const { default: useAuthStore } = await import("../Stores/useAuthStore");
  const state = useAuthStore.getState();
  const token = state.access_token;
  const user = state.loggedInUser;
  if (!token || !user) {
    throw new Error("No authentication token or user available");
  }
  return { token, user };
}

export const fetchBillDetails = async (
  contractId: string
): Promise<Bill[] | null> => {
  try {
    const res: any = await apiClient.get(`/bills/contract/${contractId}`);
    return res;
  } catch (error) {
    console.error("fetchBillDetails error:", error);
    return null;
  }
}

export const downloadBillProof = async (billId: string): Promise<string | null> => {
  try {
    // Get the access token to append to URL for authentication
    const authStorage = await AsyncStorage.getItem("auth-storage");
    const token = authStorage ? JSON.parse(authStorage)?.state?.access_token : null;
    
    // Construct the PDF download URL
    let pdfUrl = `${API_URL}/bills/${billId}/download`;
    
    // Add token as query parameter if available (for authentication in browser)
    if (token) {
      pdfUrl += `?token=${encodeURIComponent(token)}`;
    }
    
    return pdfUrl;
  }
  catch (error) {
    console.error("downloadBillProof error:", error);
    return null;
  }
}

export const uploadBillTransferImage = async (
  billId: string,
  imageUri: string
) => {
  const { token } = await getAuthData();

  const formData = new FormData();
  const filename = imageUri.split("/").pop() || "bill-transfer.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: imageUri,
    name: filename,
    type: type,
  } as any);

  const response = await fetch(
    `${API_URL}/bills/${billId}/upload-image-proof`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    // Try to parse error as JSON, fallback to text
    let errorData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      errorData = await response.json().catch(() => ({}));
    } else {
      errorData = await response.text();
    }
    throw new Error(
      (typeof errorData === "object" ? errorData?.error || errorData?.message : errorData) ||
      "Failed to upload bill transfer image"
    );
  }

  // Handle non-JSON success response
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
};

export const setStatusBill = async (
  billId: string,
  status: string
) => {
  try{
    // Backend expects `status` as a request parameter (e.g. ?status=PAID)
    const response = await apiClient.put(
      `/bills/${billId}/status`,
      null,
      {
        params: { status },
      }
    );
  return response;
  } catch (error) {
    console.error("setStatusBill error:", error);
    return null;
  }
};