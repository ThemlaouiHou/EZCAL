# Scrape

## OpenAPI

````yaml v2-openapi POST /scrape
paths:
  path: /scrape
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
              url:
                allOf:
                  - type: string
                    format: uri
                    description: The URL to scrape
              formats:
                allOf:
                  - $ref: '#/components/schemas/Formats'
              onlyMainContent:
                allOf:
                  - type: boolean
                    description: >-
                      Only return the main content of the page excluding
                      headers, navs, footers, etc.
                    default: true
              includeTags:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: Tags to include in the output.
              excludeTags:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: Tags to exclude from the output.
              maxAge:
                allOf:
                  - type: integer
                    description: >-
                      Returns a cached version of the page if it is younger than
                      this age in milliseconds. If a cached version of the page
                      is older than this value, the page will be scraped. If you
                      do not need extremely fresh data, enabling this can speed
                      up your scrapes by 500%. Defaults to 2 days.
                    default: 172800000
              headers:
                allOf:
                  - type: object
                    description: >-
                      Headers to send with the request. Can be used to send
                      cookies, user-agent, etc.
              waitFor:
                allOf:
                  - type: integer
                    description: >-
                      Specify a delay in milliseconds before fetching the
                      content, allowing the page sufficient time to load.
                    default: 0
              mobile:
                allOf:
                  - type: boolean
                    description: >-
                      Set to true if you want to emulate scraping from a mobile
                      device. Useful for testing responsive pages and taking
                      mobile screenshots.
                    default: false
              skipTlsVerification:
                allOf:
                  - type: boolean
                    description: Skip TLS certificate verification when making requests
                    default: true
              timeout:
                allOf:
                  - type: integer
                    description: Timeout in milliseconds for the request.
              parsers:
                allOf:
                  - type: array
                    description: >-
                      Controls how files are processed during scraping. When
                      "pdf" is included (default), the PDF content is extracted
                      and converted to markdown format, with billing based on
                      the number of pages (1 credit per page). When an empty
                      array is passed, the PDF file is returned in base64
                      encoding with a flat rate of 1 credit total.
                    items:
                      type: string
                      enum:
                        - pdf
                    default:
                      - pdf
              actions:
                allOf:
                  - type: array
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
                                Take a screenshot. The links will be in the
                                response's `actions.screenshots` array.
                            fullPage:
                              type: boolean
                              description: >-
                                Whether to capture a full-page screenshot or
                                limit to the current viewport.
                              default: false
                            quality:
                              type: integer
                              description: >-
                                The quality of the screenshot, from 1 to 100.
                                100 is the highest quality.
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
                                Clicks all elements matched by the selector, not
                                just the first one. Does not throw an error if
                                no elements match the selector.
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
                                contenteditable element. Note: You must first
                                focus the element using a 'click' action before
                                writing. The text will be typed character by
                                character to simulate keyboard input.
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
                                Scrape the current page content, returns the url
                                and the html.
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
                                Generate a PDF of the current page. The PDF will
                                be returned in the `actions.pdfs` array of the
                                response.
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
                              description: >-
                                Whether to generate the PDF in landscape
                                orientation
                              default: false
                            scale:
                              type: number
                              description: The scale multiplier of the resulting PDF
                              default: 1
                          required:
                            - type
              location:
                allOf:
                  - type: object
                    description: >-
                      Location settings for the request. When specified, this
                      will use an appropriate proxy if available and emulate the
                      corresponding language and timezone settings. Defaults to
                      'US' if not specified.
                    properties:
                      country:
                        type: string
                        description: >-
                          ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU',
                          'DE', 'JP')
                        pattern: ^[A-Z]{2}$
                        default: US
                      languages:
                        type: array
                        description: >-
                          Preferred languages and locales for the request in
                          order of priority. Defaults to the language of the
                          specified location. See
                          https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
                        items:
                          type: string
                          example: en-US
              removeBase64Images:
                allOf:
                  - type: boolean
                    description: >-
                      Removes all base 64 images from the output, which may be
                      overwhelmingly long. The image's alt text remains in the
                      output, but the URL is replaced with a placeholder.
                    default: true
              blockAds:
                allOf:
                  - type: boolean
                    description: Enables ad-blocking and cookie popup blocking.
                    default: true
              proxy:
                allOf:
                  - type: string
                    enum:
                      - basic
                      - stealth
                      - auto
                    description: >-
                      Specifies the type of proxy to use.

                       - **basic**: Proxies for scraping sites with none to basic anti-bot solutions. Fast and usually works.
                       - **stealth**: Stealth proxies for scraping sites with advanced anti-bot solutions. Slower, but more reliable on certain sites. Costs up to 5 credits per request.
                       - **auto**: Firecrawl will automatically retry scraping with stealth proxies if the basic proxy fails. If the retry with stealth is successful, 5 credits will be billed for the scrape. If the first attempt with basic is successful, only the regular cost will be billed.

                      If you do not specify a proxy, Firecrawl will default to
                      auto.
                    default: auto
              storeInCache:
                allOf:
                  - type: boolean
                    description: >-
                      If true, the page will be stored in the Firecrawl index
                      and cache. Setting this to false is useful if your
                      scraping activity may have data protection concerns. Using
                      some parameters associated with sensitive scraping
                      (actions, headers) will force this parameter to be false.
                    default: true
              zeroDataRetention:
                allOf:
                  - type: boolean
                    default: false
                    description: >-
                      If true, this will enable zero data retention for this
                      scrape. To enable this feature, please contact
                      help@firecrawl.dev
            required: true
            refIdentifier: '#/components/schemas/ScrapeOptions'
            requiredProperties:
              - url
        examples:
          example:
            value:
              url: <string>
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
              zeroDataRetention: false
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
                      markdown:
                        type: string
                      summary:
                        type: string
                        nullable: true
                        description: Summary of the page if `summary` is in `formats`
                      html:
                        type: string
                        nullable: true
                        description: >-
                          HTML version of the content on page if `html` is in
                          `formats`
                      rawHtml:
                        type: string
                        nullable: true
                        description: >-
                          Raw HTML content of the page if `rawHtml` is in
                          `formats`
                      screenshot:
                        type: string
                        nullable: true
                        description: Screenshot of the page if `screenshot` is in `formats`
                      links:
                        type: array
                        items:
                          type: string
                        description: List of links on the page if `links` is in `formats`
                      actions:
                        type: object
                        nullable: true
                        description: >-
                          Results of the actions specified in the `actions`
                          parameter. Only present if the `actions` parameter was
                          provided in the request
                        properties:
                          screenshots:
                            type: array
                            description: >-
                              Screenshot URLs, in the same order as the
                              screenshot actions provided.
                            items:
                              type: string
                              format: url
                          scrapes:
                            type: array
                            description: >-
                              Scrape contents, in the same order as the scrape
                              actions provided.
                            items:
                              type: object
                              properties:
                                url:
                                  type: string
                                html:
                                  type: string
                          javascriptReturns:
                            type: array
                            description: >-
                              JavaScript return values, in the same order as the
                              executeJavascript actions provided.
                            items:
                              type: object
                              properties:
                                type:
                                  type: string
                                value: {}
                          pdfs:
                            type: array
                            description: >-
                              PDFs generated, in the same order as the pdf
                              actions provided.
                            items:
                              type: string
                      metadata:
                        type: object
                        properties:
                          title:
                            type: string
                          description:
                            type: string
                          language:
                            type: string
                            nullable: true
                          sourceURL:
                            type: string
                            format: uri
                          '<any other metadata> ':
                            type: string
                          statusCode:
                            type: integer
                            description: The status code of the page
                          error:
                            type: string
                            nullable: true
                            description: The error message of the page
                      warning:
                        type: string
                        nullable: true
                        description: >-
                          Can be displayed when using LLM Extraction. Warning
                          message will let you know any issues with the
                          extraction.
                      changeTracking:
                        type: object
                        nullable: true
                        description: >-
                          Change tracking information if `changeTracking` is in
                          `formats`. Only present when the `changeTracking`
                          format is requested.
                        properties:
                          previousScrapeAt:
                            type: string
                            format: date-time
                            nullable: true
                            description: >-
                              The timestamp of the previous scrape that the
                              current page is being compared against. Null if no
                              previous scrape exists.
                          changeStatus:
                            type: string
                            enum:
                              - new
                              - same
                              - changed
                              - removed
                            description: >-
                              The result of the comparison between the two page
                              versions. 'new' means this page did not exist
                              before, 'same' means content has not changed,
                              'changed' means content has changed, 'removed'
                              means the page was removed.
                          visibility:
                            type: string
                            enum:
                              - visible
                              - hidden
                            description: >-
                              The visibility of the current page/URL. 'visible'
                              means the URL was discovered through an organic
                              route (links or sitemap), 'hidden' means the URL
                              was discovered through memory from previous
                              crawls.
                          diff:
                            type: string
                            nullable: true
                            description: >-
                              Git-style diff of changes when using 'git-diff'
                              mode. Only present when the mode is set to
                              'git-diff'.
                          json:
                            type: object
                            nullable: true
                            description: >-
                              JSON comparison results when using 'json' mode.
                              Only present when the mode is set to 'json'. This
                              will emit a list of all the keys and their values
                              from the `previous` and `current` scrapes based on
                              the type defined in the `schema`. Example
                              [here](/features/change-tracking)
            refIdentifier: '#/components/schemas/ScrapeResponse'
        examples:
          example:
            value:
              success: true
              data:
                markdown: <string>
                summary: <string>
                html: <string>
                rawHtml: <string>
                screenshot: <string>
                links:
                  - <string>
                actions:
                  screenshots:
                    - <string>
                  scrapes:
                    - url: <string>
                      html: <string>
                  javascriptReturns:
                    - type: <string>
                      value: <any>
                  pdfs:
                    - <string>
                metadata:
                  title: <string>
                  description: <string>
                  language: <string>
                  sourceURL: <string>
                  '<any other metadata> ': <string>
                  statusCode: 123
                  error: <string>
                warning: <string>
                changeTracking:
                  previousScrapeAt: '2023-11-07T05:31:56Z'
                  changeStatus: new
                  visibility: visible
                  diff: <string>
                  json: {}
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

````