/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAppointment = /* GraphQL */ `
  query GetAppointment($id: ID!) {
    getAppointment(id: $id) {
      id
      client
      time
      type
      note
      email
      createdAt
      updatedAt
    }
  }
`;
export const listAppointments = /* GraphQL */ `
  query ListAppointments(
    $filter: ModelAppointmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAppointments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        client
        time
        type
        note
        email
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getAvailability = /* GraphQL */ `
  query GetAvailability($id: ID!) {
    getAvailability(id: $id) {
      id
      time
      createdAt
      updatedAt
    }
  }
`;
export const listAvailabilities = /* GraphQL */ `
  query ListAvailabilities(
    $filter: ModelAvailabilityFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAvailabilities(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        time
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
