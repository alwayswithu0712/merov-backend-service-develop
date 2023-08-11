export interface SardineVerificationResult {
    verificationId: string,
    status: 'pending' | 'processing' | 'complete' | 'error',
    documentData: {
      type: 'passport' | 'driver_license' | 'visa' | 'social_security_card' | 'other' | 'unknown'
      number:  string,
      dateOfBirth:  string,
      dateOfIssue:  string,
      dateOfExpiry: string,
      issuingCountry: string,
      firstName: string,
      middleName: string,
      lastName: string,
      gender: 'male' | 'female' | 'other',
      address: string,
    },
    verification: {
      riskLevel: 'high' | 'medium' | 'low' | 'unknown',
      forgeryLevel: 'high' | 'medium' | 'low',
      documentMatchLevel: 'high' | 'medium' | 'low' | 'not_applicable',
      imageQualityLevel: 'high' | 'medium' | 'low',
      faceMatchLevel: 'high' | 'medium' | 'low' | 'not_applicable' | 'error',
    }
    clientData?: {
        ip: {
            address: string;
            location: unknown
        }
    }
    errorCodes: string[],
    // unrecognizable_document -> Document could not be recognized, please resubmit with higher resolution image
    // requires_recapture -> Provided document requires recapturing
    // document_bad_size_or_type -> Either file size or type of provided document is not supported
}