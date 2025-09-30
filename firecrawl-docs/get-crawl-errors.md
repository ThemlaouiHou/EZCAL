# Get Crawl Errors

## OpenAPI

````yaml v2-openapi GET /crawl/{id}/errors
paths:
  path: /crawl/{id}/errors
  method: get
  servers:
    - url: https://api.firecrawl.dev/v2
  request:
    security:
      - title: bearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
          cookie: {}
    parameters:
      path:
        id:
          schema:
            - type: string
              required: true
              description: The ID of the crawl job
              format: uuid
      query: {}
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              errors:
                allOf:
                  - type: array
                    description: Errored scrape jobs and error details
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        timestamp:
                          type: string
                          nullable: true
                          description: ISO timestamp of failure
                        url:
                          type: string
                          description: Scraped URL
                        error:
                          type: string
                          description: Error message
              robotsBlocked:
                allOf:
                  - type: array
                    description: >-
                      List of URLs that were attempted in scraping but were
                      blocked by robots.txt
                    items:
                      type: string
            refIdentifier: '#/components/schemas/CrawlErrorsResponseObj'
        examples:
          example:
            value:
              errors:
                - id: <string>
                  timestamp: <string>
                  url: <string>
                  error: <string>
              robotsBlocked:
                - <string>
        description: Successful response
    '402':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - type: string
                    example: Payment required to access this resource.
        examples:
          example:
            value:
              error: Payment required to access this resource.
        description: Payment required
    '429':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - type: string
                    example: >-
                      Request rate limit exceeded. Please wait and try again
                      later.
        examples:
          example:
            value:
              error: Request rate limit exceeded. Please wait and try again later.
        description: Too many requests
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - type: string
                    example: An unexpected error occurred on the server.
        examples:
          example:
            value:
              error: An unexpected error occurred on the server.
        description: Server error
  deprecated: false
  type: path
components:
  schemas: {}

````