# Search

## OpenAPI

````yaml v2-openapi POST /search
paths:
  path: /search
  method: post
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
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              query:
                allOf:
                  - type: string
                    description: The search query
              limit:
                allOf:
                  - type: integer
                    description: Maximum number of results to return
                    default: 5
                    maximum: 100
                    minimum: 1
              sources:
                allOf:
                  - type: array
                    items:
                      oneOf:
                        - type: object
                          title: Web
                          properties:
                            type:
                              type: string
                              enum:
                                - web
                            tbs:
                              type: string
                              description: >-
                                Time-based search parameter. Supports predefined
                                time ranges (`qdr:h`, `qdr:d`, `qdr:w`, `qdr:m`,
                                `qdr:y`) and custom date ranges
                                (`cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY`)
                            location:
                              type: string
                              description: Location parameter for search results
                          required:
                            - type
                        - type: object
                          title: Images
                          properties:
                            type:
                              type: string
                              enum:
                                - images
                          required:
                            - type
                        - type: object
                          title: News
                          properties:
                            type:
                              type: string
                              enum:
                                - news
                          required:
                            - type
                    description: >-
                      Sources to search. Will determine the arrays available in
                      the response.
                    default:
                      - web
              categories:
                allOf:
                  - type: array
                    items:
                      oneOf:
                        - type: object
                          title: GitHub
                          properties:
                            type:
                              type: string
                              enum:
                                - github
                          required:
                            - type
                        - type: object
                          title: Research
                          properties:
                            type:
                              type: string
                              enum:
                                - research
                          required:
                            - type
                    description: Categories to filter results by
              tbs:
                allOf:
                  - type: string
                    description: >-
                      Time-based search parameter. Supports predefined time
                      ranges (`qdr:h`, `qdr:d`, `qdr:w`, `qdr:m`, `qdr:y`) and
                      custom date ranges
                      (`cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY`)
              location:
                allOf:
                  - type: string
                    description: Location parameter for search results
              timeout:
                allOf:
                  - type: integer
                    description: Timeout in milliseconds
                    default: 60000
              ignoreInvalidURLs:
                allOf:
                  - type: boolean
                    description: >-
                      Excludes URLs from the search results that are invalid for
                      other Firecrawl endpoints. This helps reduce errors if you
                      are piping data from search into other Firecrawl API
                      endpoints.
                    default: false
              scrapeOptions:
                allOf:
                  - allOf:
                      - $ref: '#/components/schemas/ScrapeOptions'
                    description: Options for scraping search results
                    default: {}
            required: true
            requiredProperties:
              - query
        examples:
          example:
            value:
              query: <string>
              limit: 5
              sources:
                - web
              categories:
                - type: github
              tbs: <string>
              location: <string>
              timeout: 60000
              ignoreInvalidURLs: false
              scrapeOptions:
                formats:
                  - markdown
                onlyMainContent: true
                includeTags:
                  - <string>
                excludeTags:
                  - <string>
                maxAge: 172800000
                headers: {}
                waitFor: 0
                mobile: false
                skipTlsVerification: true
                timeout: 123
                parsers:
                  - pdf
                actions:
                  - type: wait
                    milliseconds: 2
                    selector: '#my-element'
                location:
                  country: US
                  languages:
                    - en-US
                removeBase64Images: true
                blockAds: true
                proxy: auto
                storeInCache: true
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
              data:
                allOf:
                  - type: object
                    properties:
                      web:
                        type: array
                        items:
                          type: object
                          properties:
                            title:
                              type: string
                              description: Title from search result
                            description:
                              type: string
                              description: Description from search result
                            url:
                              type: string
                              description: URL of the search result
                            markdown:
                              type: string
                              nullable: true
                              description: Markdown content if scraping was requested
                            html:
                              type: string
                              nullable: true
                              description: HTML content if requested in formats
                            rawHtml:
                              type: string
                              nullable: true
                              description: Raw HTML content if requested in formats
                            links:
                              type: array
                              items:
                                type: string
                              description: Links found if requested in formats
                            screenshot:
                              type: string
                              nullable: true
                              description: Screenshot URL if requested in formats
                            metadata:
                              type: object
                              properties:
                                title:
                                  type: string
                                description:
                                  type: string
                                sourceURL:
                                  type: string
                                statusCode:
                                  type: integer
                                error:
                                  type: string
                                  nullable: true
                      images:
                        type: array
                        items:
                          type: object
                          properties:
                            title:
                              type: string
                              description: Title from search result
                            imageUrl:
                              type: string
                              description: URL of the image
                            imageWidth:
                              type: integer
                              description: Width of the image
                            imageHeight:
                              type: integer
                              description: Height of the image
                            url:
                              type: string
                              description: URL of the search result
                            position:
                              type: integer
                              description: Position of the search result
                      news:
                        type: array
                        items:
                          type: object
                          properties:
                            title:
                              type: string
                              description: Title of the article
                            snippet:
                              type: string
                              description: Snippet from the article
                            url:
                              type: string
                              description: URL of the article
                            date:
                              type: string
                              description: Date of the article
                            imageUrl:
                              type: string
                              description: Image URL of the article
                            position:
                              type: integer
                              description: Position of the article
                            markdown:
                              type: string
                              nullable: true
                              description: Markdown content if scraping was requested
                            html:
                              type: string
                              nullable: true
                              description: HTML content if requested in formats
                            rawHtml:
                              type: string
                              nullable: true
                              description: Raw HTML content if requested in formats
                            links:
                              type: array
                              items:
                                type: string
                              description: Links found if requested in formats
                            screenshot:
                              type: string
                              nullable: true
                              description: Screenshot URL if requested in formats
                            metadata:
                              type: object
                              properties:
                                title:
                                  type: string
                                description:
                                  type: string
                                sourceURL:
                                  type: string
                                statusCode:
                                  type: integer
                                error:
                                  type: string
                                  nullable: true
                    description: >-
                      The search results. The arrays available will depend on
                      the sources you specified in the request. By default, the
                      `web` array will be returned.
              warning:
                allOf:
                  - type: string
                    nullable: true
                    description: Warning message if any issues occurred
        examples:
          example:
            value:
              success: true
              data:
                web:
                  - title: <string>
                    description: <string>
                    url: <string>
                    markdown: <string>
                    html: <string>
                    rawHtml: <string>
                    links:
                      - <string>
                    screenshot: <string>
                    metadata:
                      title: <string>
                      description: <string>
                      sourceURL: <string>
                      statusCode: 123
                      error: <string>
                images:
                  - title: <string>
                    imageUrl: <string>
                    imageWidth: 123
                    imageHeight: 123
                    url: <string>
                    position: 123
                news:
                  - title: <string>
                    snippet: <string>
                    url: <string>
                    date: <string>
                    imageUrl: <string>
                    position: 123
                    markdown: <string>
                    html: <string>
                    rawHtml: <string>
                    links:
                      - <string>
                    screenshot: <string>
                    metadata:
                      title: <string>
                      description: <string>
                      sourceURL: <string>
                      statusCode: 123
                      error: <string>
              warning: <string>
        description: Successful response
    '408':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
                    example: false
              error:
                allOf:
                  - type: string
                    example: Request timed out
        examples:
          example:
            value:
              success: false
              error: Request timed out
        description: Request timeout
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
                    example: false
              code:
                allOf:
                  - type: string
                    example: UNKNOWN_ERROR
              error:
                allOf:
                  - type: string
                    example: An unexpected error occurred on the server.
        examples:
          example:
            value:
              success: false
              code: UNKNOWN_ERROR
              error: An unexpected error occurred on the server.
        description: Server error
  deprecated: false
  type: path
components:
  schemas:
    Formats:
      type: array
      items:
        oneOf:
          - type: object
            title: Markdown
            properties:
              type:
                type: string
                enum:
                  - markdown
            required:
              - type
          - type: object
            title: Summary
            properties:
              type:
                type: string
                enum:
                  - summary
            required:
              - type
          - type: object
            title: HTML
            properties:
              type:
                type: string
                enum:
                  - html
            required:
              - type
          - type: object
            title: Raw HTML
            properties:
              type:
                type: string
                enum:
                  - rawHtml
            required:
              - type
          - type: object
            title: Links
            properties:
              type:
                type: string
                enum:
                  - links
            required:
              - type
          - type: object
            title: Screenshot
            properties:
              type:
                type: string
                enum:
                  - screenshot
              fullPage:
                type: boolean
                description: >-
                  Whether to capture a full-page screenshot or limit to the
                  current viewport.
                default: false
              quality:
                type: integer
                description: >-
                  The quality of the screenshot, from 1 to 100. 100 is the
                  highest quality.
              viewport:
                type: object
                properties:
                  width:
                    type: integer
                    description: The width of the viewport in pixels
                  height:
                    type: integer
                    description: The height of the viewport in pixels
                required:
                  - width
                  - height
            required:
              - type
          - type: object
            title: JSON
            properties:
              type:
                type: string
                enum:
                  - json
              schema:
                type: object
                description: >-
                  The schema to use for the JSON output. Must conform to [JSON
                  Schema](https://json-schema.org/).
              prompt:
                type: string
                description: The prompt to use for the JSON output
            required:
              - type
          - type: object
            title: Change Tracking
            properties:
              type:
                type: string
                enum:
                  - changeTracking
              modes:
                type: array
                items:
                  type: string
                  enum:
                    - git-diff
                    - json
                description: >-
                  The mode to use for change tracking. 'git-diff' provides a
                  detailed diff, and 'json' compares extracted JSON data.
              schema:
                type: object
                description: >-
                  Schema for JSON extraction when using 'json' mode. Defines the
                  structure of data to extract and compare. Must conform to
                  [JSON Schema](https://json-schema.org/).
              prompt:
                type: string
                description: >-
                  Prompt to use for change tracking when using 'json' mode. If
                  not provided, the default prompt will be used.
              tag:
                type: string
                nullable: true
                default: null
                description: >-
                  Tag to use for change tracking. Tags can separate change
                  tracking history into separate "branches", where change
                  tracking with a specific tagwill only compare to scrapes made
                  in the same tag. If not provided, the default tag (null) will
                  be used.
            required:
              - type
      description: >-
        Output formats to include in the response. You can specify one or more
        formats, either as strings (e.g., `'markdown'`) or as objects with
        additional options (e.g., `{ type: 'json', schema: {...} }`). Some
        formats require specific options to be set. Example: `['markdown', {
        type: 'json', schema: {...} }]`.
      default:
        - markdown
    ScrapeOptions:
      type: object
      properties:
        formats:
          $ref: '#/components/schemas/Formats'
        onlyMainContent:
          type: boolean
          description: >-
            Only return the main content of the page excluding headers, navs,
            footers, etc.
          default: true
        includeTags:
          type: array
          items:
            type: string
          description: Tags to include in the output.
        excludeTags:
          type: array
          items:
            type: string
          description: Tags to exclude from the output.
        maxAge:
          type: integer
          description: >-
            Returns a cached version of the page if it is younger than this age
            in milliseconds. If a cached version of the page is older than this
            value, the page will be scraped. If you do not need extremely fresh
            data, enabling this can speed up your scrapes by 500%. Defaults to 2
            days.
          default: 172800000
        headers:
          type: object
          description: >-
            Headers to send with the request. Can be used to send cookies,
            user-agent, etc.
        waitFor:
          type: integer
          description: >-
            Specify a delay in milliseconds before fetching the content,
            allowing the page sufficient time to load.
          default: 0
        mobile:
          type: boolean
          description: >-
            Set to true if you want to emulate scraping from a mobile device.
            Useful for testing responsive pages and taking mobile screenshots.
          default: false
        skipTlsVerification:
          type: boolean
          description: Skip TLS certificate verification when making requests
          default: true
        timeout:
          type: integer
          description: Timeout in milliseconds for the request.
        parsers:
          type: array
          description: >-
            Controls how files are processed during scraping. When "pdf" is
            included (default), the PDF content is extracted and converted to
            markdown format, with billing based on the number of pages (1 credit
            per page). When an empty array is passed, the PDF file is returned
            in base64 encoding with a flat rate of 1 credit total.
          items:
            type: string
            enum:
              - pdf
          default:
            - pdf
        actions:
          type: array
          description: Actions to perform on the page before grabbing the content
          items:
            oneOf:
              - type: object
                title: Wait
                properties:
                  type:
                    type: string
                    enum:
                      - wait
                    description: Wait for a specified amount of milliseconds
                  milliseconds:
                    type: integer
                    minimum: 1
                    description: Number of milliseconds to wait
                  selector:
                    type: string
                    description: Query selector to find the element by
                    example: '#my-element'
                required:
                  - type
              - type: object
                title: Screenshot
                properties:
                  type:
                    type: string
                    enum:
                      - screenshot
                    description: >-
                      Take a screenshot. The links will be in the response's
                      `actions.screenshots` array.
                  fullPage:
                    type: boolean
                    description: >-
                      Whether to capture a full-page screenshot or limit to the
                      current viewport.
                    default: false
                  quality:
                    type: integer
                    description: >-
                      The quality of the screenshot, from 1 to 100. 100 is the
                      highest quality.
                  viewport:
                    type: object
                    properties:
                      width:
                        type: integer
                        description: The width of the viewport in pixels
                      height:
                        type: integer
                        description: The height of the viewport in pixels
                    required:
                      - width
                      - height
                required:
                  - type
              - type: object
                title: Click
                properties:
                  type:
                    type: string
                    enum:
                      - click
                    description: Click on an element
                  selector:
                    type: string
                    description: Query selector to find the element by
                    example: '#load-more-button'
                  all:
                    type: boolean
                    description: >-
                      Clicks all elements matched by the selector, not just the
                      first one. Does not throw an error if no elements match
                      the selector.
                    default: false
                required:
                  - type
                  - selector
              - type: object
                title: Write text
                properties:
                  type:
                    type: string
                    enum:
                      - write
                    description: >-
                      Write text into an input field, text area, or
                      contenteditable element. Note: You must first focus the
                      element using a 'click' action before writing. The text
                      will be typed character by character to simulate keyboard
                      input.
                  text:
                    type: string
                    description: Text to type
                    example: Hello, world!
                required:
                  - type
                  - text
              - type: object
                title: Press a key
                description: >-
                  Press a key on the page. See
                  https://asawicki.info/nosense/doc/devices/keyboard/key_codes.html
                  for key codes.
                properties:
                  type:
                    type: string
                    enum:
                      - press
                    description: Press a key on the page
                  key:
                    type: string
                    description: Key to press
                    example: Enter
                required:
                  - type
                  - key
              - type: object
                title: Scroll
                properties:
                  type:
                    type: string
                    enum:
                      - scroll
                    description: Scroll the page or a specific element
                  direction:
                    type: string
                    enum:
                      - up
                      - down
                    description: Direction to scroll
                    default: down
                  selector:
                    type: string
                    description: Query selector for the element to scroll
                    example: '#my-element'
                required:
                  - type
              - type: object
                title: Scrape
                properties:
                  type:
                    type: string
                    enum:
                      - scrape
                    description: >-
                      Scrape the current page content, returns the url and the
                      html.
                required:
                  - type
              - type: object
                title: Execute JavaScript
                properties:
                  type:
                    type: string
                    enum:
                      - executeJavascript
                    description: Execute JavaScript code on the page
                  script:
                    type: string
                    description: JavaScript code to execute
                    example: document.querySelector('.button').click();
                required:
                  - type
                  - script
              - type: object
                title: Generate PDF
                properties:
                  type:
                    type: string
                    enum:
                      - pdf
                    description: >-
                      Generate a PDF of the current page. The PDF will be
                      returned in the `actions.pdfs` array of the response.
                  format:
                    type: string
                    enum:
                      - A0
                      - A1
                      - A2
                      - A3
                      - A4
                      - A5
                      - A6
                      - Letter
                      - Legal
                      - Tabloid
                      - Ledger
                    description: The page size of the resulting PDF
                    default: Letter
                  landscape:
                    type: boolean
                    description: Whether to generate the PDF in landscape orientation
                    default: false
                  scale:
                    type: number
                    description: The scale multiplier of the resulting PDF
                    default: 1
                required:
                  - type
        location:
          type: object
          description: >-
            Location settings for the request. When specified, this will use an
            appropriate proxy if available and emulate the corresponding
            language and timezone settings. Defaults to 'US' if not specified.
          properties:
            country:
              type: string
              description: ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU', 'DE', 'JP')
              pattern: ^[A-Z]{2}$
              default: US
            languages:
              type: array
              description: >-
                Preferred languages and locales for the request in order of
                priority. Defaults to the language of the specified location.
                See
                https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
              items:
                type: string
                example: en-US
        removeBase64Images:
          type: boolean
          description: >-
            Removes all base 64 images from the output, which may be
            overwhelmingly long. The image's alt text remains in the output, but
            the URL is replaced with a placeholder.
          default: true
        blockAds:
          type: boolean
          description: Enables ad-blocking and cookie popup blocking.
          default: true
        proxy:
          type: string
          enum:
            - basic
            - stealth
            - auto
          description: |-
            Specifies the type of proxy to use.

             - **basic**: Proxies for scraping sites with none to basic anti-bot solutions. Fast and usually works.
             - **stealth**: Stealth proxies for scraping sites with advanced anti-bot solutions. Slower, but more reliable on certain sites. Costs up to 5 credits per request.
             - **auto**: Firecrawl will automatically retry scraping with stealth proxies if the basic proxy fails. If the retry with stealth is successful, 5 credits will be billed for the scrape. If the first attempt with basic is successful, only the regular cost will be billed.

            If you do not specify a proxy, Firecrawl will default to auto.
          default: auto
        storeInCache:
          type: boolean
          description: >-
            If true, the page will be stored in the Firecrawl index and cache.
            Setting this to false is useful if your scraping activity may have
            data protection concerns. Using some parameters associated with
            sensitive scraping (actions, headers) will force this parameter to
            be false.
          default: true

````