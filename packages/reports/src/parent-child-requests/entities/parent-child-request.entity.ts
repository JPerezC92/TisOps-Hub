/**
 * Parent-Child Request Relationship entity
 * Represents a relationship between two ManageEngine requests
 */
export interface ParentChildRequest {
  id: number;
  requestId: string;
  linkedRequestId: string;
  requestIdLink?: string | null;
  linkedRequestIdLink?: string | null;
}

/**
 * Response type for parent-child request statistics
 */
export interface ParentChildRequestStats {
  totalRelationships: number;
  uniqueParents: number;
  uniqueChildren: number;
  averageChildrenPerParent: number;
}

/**
 * Response type for API endpoints returning parent-child request data
 */
export interface ParentChildRequestResponse {
  data: ParentChildRequest[];
  total: number;
}
