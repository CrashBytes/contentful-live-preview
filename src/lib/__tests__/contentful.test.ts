import type * as ContentfulLib from '../contentful';

// Mock the contentful module
jest.mock('contentful', () => ({
  createClient: jest.fn(),
}));

describe('contentful library', () => {
  let mockClient: any;
  let mockPreviewClient: any;

  // The contentful module creates its delivery and preview clients at import
  // time (module scope). To make the mocked clients deterministic per test, we
  // reset the module registry and re-import the module after configuring the
  // createClient mock, so the two clients are constructed from our mocks.
  let getClient: typeof ContentfulLib.getClient;
  let fetchEntry: typeof ContentfulLib.fetchEntry;
  let fetchEntries: typeof ContentfulLib.fetchEntries;
  let fetchEntriesByField: typeof ContentfulLib.fetchEntriesByField;
  let fetchContentTypes: typeof ContentfulLib.fetchContentTypes;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Create mock client methods
    const createMockClient = () => ({
      getEntry: jest.fn(),
      getEntries: jest.fn(),
      getContentTypes: jest.fn(),
    });

    mockClient = createMockClient();
    mockPreviewClient = createMockClient();

    // Mock createClient to return our mock clients. The contentful module
    // constructs the delivery client first and the preview client second.
    const { createClient } = require('contentful');
    (createClient as jest.Mock)
      .mockReturnValueOnce(mockClient) // First call (regular client)
      .mockReturnValueOnce(mockPreviewClient); // Second call (preview client)

    // Import the module under test AFTER the mock is configured so its
    // module-scope clients are built from the mocks above.
    const contentful = require('../contentful');
    getClient = contentful.getClient;
    fetchEntry = contentful.fetchEntry;
    fetchEntries = contentful.fetchEntries;
    fetchEntriesByField = contentful.fetchEntriesByField;
    fetchContentTypes = contentful.fetchContentTypes;
  });

  describe('getClient', () => {
    it('should return regular client when preview is false', () => {
      const client = getClient(false);
      expect(client).toBe(mockClient);
    });

    it('should return preview client when preview is true', () => {
      const client = getClient(true);
      expect(client).toBe(mockPreviewClient);
    });

    it('should default to regular client when no argument provided', () => {
      const client = getClient();
      expect(client).toBe(mockClient);
    });
  });

  describe('fetchEntry', () => {
    const mockEntry = {
      sys: { id: 'test-id' },
      fields: { title: 'Test Entry' },
    };

    it('should fetch entry successfully', async () => {
      mockClient.getEntry.mockResolvedValue(mockEntry);

      const result = await fetchEntry('test-id', false);

      expect(mockClient.getEntry).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockEntry);
    });

    it('should use preview client when preview is true', async () => {
      mockPreviewClient.getEntry.mockResolvedValue(mockEntry);

      const result = await fetchEntry('test-id', true);

      expect(mockPreviewClient.getEntry).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockEntry);
    });

    it('should return null on error', async () => {
      mockClient.getEntry.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await fetchEntry('test-id', false);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching entry with ID: test-id',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('defaults to the regular client when preview is omitted', async () => {
      mockClient.getEntry.mockResolvedValue(mockEntry);

      const result = await fetchEntry('test-id');

      expect(mockClient.getEntry).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockEntry);
    });
  });

  describe('fetchEntries', () => {
    const mockEntries = {
      items: [
        { sys: { id: '1' }, fields: { title: 'Entry 1' } },
        { sys: { id: '2' }, fields: { title: 'Entry 2' } },
      ],
    };

    it('should fetch entries successfully', async () => {
      mockClient.getEntries.mockResolvedValue(mockEntries);

      const result = await fetchEntries('blogPost', false);

      expect(mockClient.getEntries).toHaveBeenCalledWith({
        content_type: 'blogPost',
      });
      expect(result).toEqual(mockEntries.items);
    });

    it('should pass additional options to getEntries', async () => {
      mockClient.getEntries.mockResolvedValue(mockEntries);

      await fetchEntries('blogPost', false, { limit: 10, skip: 5 });

      expect(mockClient.getEntries).toHaveBeenCalledWith({
        content_type: 'blogPost',
        limit: 10,
        skip: 5,
      });
    });

    it('should use preview client when preview is true', async () => {
      mockPreviewClient.getEntries.mockResolvedValue(mockEntries);

      await fetchEntries('blogPost', true);

      expect(mockPreviewClient.getEntries).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockClient.getEntries.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await fetchEntries('blogPost', false);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('defaults preview and options when omitted', async () => {
      mockClient.getEntries.mockResolvedValue(mockEntries);

      await fetchEntries('blogPost');

      expect(mockClient.getEntries).toHaveBeenCalledWith({
        content_type: 'blogPost',
      });
    });
  });

  describe('fetchEntriesByField', () => {
    const mockEntries = {
      items: [{ sys: { id: '1' }, fields: { title: 'Entry 1' } }],
    };

    it('should fetch entries by field value', async () => {
      mockClient.getEntries.mockResolvedValue(mockEntries);

      const result = await fetchEntriesByField(
        'blogPost',
        'author',
        'john-doe',
        false
      );

      expect(mockClient.getEntries).toHaveBeenCalledWith({
        content_type: 'blogPost',
        'fields.author': 'john-doe',
      });
      expect(result).toEqual(mockEntries.items);
    });

    it('should handle wildcard field values with [exists] query', async () => {
      mockClient.getEntries.mockResolvedValue(mockEntries);

      await fetchEntriesByField('blogPost', 'featuredImage', '*', false);

      expect(mockClient.getEntries).toHaveBeenCalledWith({
        content_type: 'blogPost',
        'fields.featuredImage[exists]': true,
      });
    });

    it('should use preview client when preview is true', async () => {
      mockPreviewClient.getEntries.mockResolvedValue(mockEntries);

      await fetchEntriesByField('blogPost', 'author', 'john-doe', true);

      expect(mockPreviewClient.getEntries).toHaveBeenCalled();
    });

    it('defaults to the regular client when preview is omitted', async () => {
      mockClient.getEntries.mockResolvedValue(mockEntries);

      await fetchEntriesByField('blogPost', 'author', 'john-doe');

      expect(mockClient.getEntries).toHaveBeenCalledWith({
        content_type: 'blogPost',
        'fields.author': 'john-doe',
      });
    });

    it('should return empty array on error', async () => {
      mockClient.getEntries.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await fetchEntriesByField(
        'blogPost',
        'author',
        'john-doe',
        false
      );

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('fetchContentTypes', () => {
    const mockContentTypes = {
      items: [
        { sys: { id: 'blogPost' }, name: 'Blog Post' },
        { sys: { id: 'author' }, name: 'Author' },
      ],
    };

    it('should fetch content types successfully', async () => {
      mockClient.getContentTypes.mockResolvedValue(mockContentTypes);

      const result = await fetchContentTypes();

      expect(mockClient.getContentTypes).toHaveBeenCalled();
      expect(result).toEqual(mockContentTypes.items);
    });

    it('should always use regular client, not preview client', async () => {
      mockClient.getContentTypes.mockResolvedValue(mockContentTypes);

      await fetchContentTypes();

      expect(mockClient.getContentTypes).toHaveBeenCalled();
      expect(mockPreviewClient.getContentTypes).not.toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockClient.getContentTypes.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await fetchContentTypes();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
