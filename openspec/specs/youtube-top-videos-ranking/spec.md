# YouTube Top Videos Ranking

## Purpose

Define the expected behavior and response contract for YouTube top videos ranking endpoints. Details can be refined as implementation and consumers evolve.

## Requirements

### Requirement: Top videos by views endpoint

The system SHALL provide an endpoint that returns YouTube videos sorted by view count in descending order.

#### Scenario: Request top videos by views with default limit

- **WHEN** a client requests top videos by views without informing a limit
- **THEN** the system returns a default-limited list sorted from highest to lowest `viewCount`

#### Scenario: Request top videos by views with explicit limit

- **WHEN** a client requests top videos by views with a valid `limit`
- **THEN** the system returns at most that number of videos sorted by descending `viewCount`

### Requirement: Top videos by likes endpoint

The system SHALL provide an endpoint that returns YouTube videos sorted by like count in descending order.

#### Scenario: Request top videos by likes with default limit

- **WHEN** a client requests top videos by likes without informing a limit
- **THEN** the system returns a default-limited list sorted from highest to lowest `likeCount`

#### Scenario: Request top videos by likes with explicit limit

- **WHEN** a client requests top videos by likes with a valid `limit`
- **THEN** the system returns at most that number of videos sorted by descending `likeCount`

### Requirement: Consistent ranking response contract

The system SHALL return a normalized response contract for both ranking endpoints.

#### Scenario: Response includes metric metadata

- **WHEN** a client receives a ranking response
- **THEN** the payload includes the applied metric identifier and total number of returned items

#### Scenario: Response includes normalized video entries

- **WHEN** a client receives video items from ranking endpoints
- **THEN** each item contains consistent core fields required by consuming dashboards

### Requirement: Limit validation for ranking endpoints

The system SHALL validate the `limit` parameter in ranking requests.

#### Scenario: Limit below minimum

- **WHEN** a client sends `limit` below the accepted minimum
- **THEN** the system rejects the request with a validation error

#### Scenario: Limit above maximum

- **WHEN** a client sends `limit` above the accepted maximum
- **THEN** the system rejects the request with a validation error
