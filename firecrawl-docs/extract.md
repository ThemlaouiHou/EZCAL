# Extract

## OpenAPI

````yaml v2-openapi POST /extract
paths:
  path: /extract
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
              urls:
                allOf:
                  - type: array
                    items:
                      type: string
                      format: uri
                      description: >-
                        The URLs to extract data from. URLs should be in glob
                        format.
              prompt:
                allOf:
                  - type: string
                    description: Prompt to guide the extraction process
              schema:
                allOf:
                  - type: object
                    description: >-
                      Schema to define the structure of the extracted data. Must
                      conform to [JSON Schema](https://json-schema.org/).
              enableWebSearch:
                allOf:
                  - type: boolean
                    description: >-
                      When true, the extraction will use web search to find
                      additional data
                    default: false
              ignoreSitemap:
                allOf:
                  - type: boolean
                    description: >-
                      When true, sitemap.xml files will be ignored during
                      website scanning
                    default: false
              includeSubdomains:
                allOf:
                  - type: boolean
                    description: >-
                      When true, subdomains of the provided URLs will also be
                      scanned
                    default: true
              showSources:
                allOf:
                  - type: boolean
                    description: >-
                      When true, the sources used to extract the data will be
                      included in the response as `sources` key
                    default: false
              scrapeOptions:
                allOf:
                  - $ref: '#/components/schemas/ScrapeOptions'
              ignoreInvalidURLs:
                allOf:
                  - type: boolean
                    default: true
                    description: >-
                      If invalid URLs are specified in the urls array, they will
                      be ignored. Instead of them failing the entire request, an
                      extract using the remaining valid URLs will be performed,
                      and the invalid URLs will be returned in the invalidURLs
                      field of the response.
            required: true
            requiredProperties:
              - urls
        examples:
          example:
            value:
              urls:
                - <string>
              prompt: <string>
              schema: {}
              enableWebSearch: false
              ignoreSitemap: false
              includeSubdomains: true
              showSources: false
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
              ignoreInvalidURLs: true
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
              id:
                allOf:
                  - type: string
              invalidURLs:
                allOf:
                  - type: array
                    nullable: true
                    items:
                      type: string
                    description: >-
                      If ignoreInvalidURLs is true, this is an array containing
                      the invalid URLs that were specified in the request. If
                      there were no invalid URLs, this will be an empty array.
                      If ignoreInvalidURLs is false, this field will be
                      undefined.
            refIdentifier: '#/components/schemas/ExtractResponse'
        examples:
          example:
            value:
              success: true
              id: <string>
              invalidURLs:
                - <string>
        description: Successful extraction
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - type: string
                    example: Invalid input data.
        examples:
          example:
            value:
              error: Invalid input data.
        description: Invalid request
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