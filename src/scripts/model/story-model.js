class StoryModel {
  constructor(apiService) {
    this.apiService = apiService;
    console.log('StoryModel initialized with apiService');
  }
  
  async getAllStories() {
    try {
      console.log('StoryModel.getAllStories: Requesting stories from API');
      const stories = await this.apiService.getAllStories();
      
      if (!stories || !Array.isArray(stories)) {
        console.warn('StoryModel: Invalid stories data received from API');
        return [];
      }
      
      console.log(`StoryModel: Successfully retrieved ${stories.length} stories`);
      return stories;
    } catch (error) {
      console.error('StoryModel: Error getting stories:', error);
      throw new Error(`Failed to load stories: ${error.message}`);
    }
  }
  
  async addNewStory(description, photoBlob, lat, lon) {
    try {
      console.log('StoryModel.addNewStory: Adding new story');
      if (!description || !photoBlob) {
        throw new Error('Description and photo are required');
      }
      
      const result = await this.apiService.addNewStory(description, photoBlob, lat, lon);
      return result;
    } catch (error) {
      console.error('StoryModel: Error adding story:', error);
      throw new Error(`Failed to add story: ${error.message}`);
    }
  }
}
window.StoryModel = StoryModel;

