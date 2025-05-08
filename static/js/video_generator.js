console.log('Video generator loaded');

// Debug log handling functions
function addLogEntry(message, type = 'info') {
  const debugLog = document.getElementById('debug-log');
  if (!debugLog) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  
  // Color-code by log type
  let color = '#0f0'; // default green for info
  switch (type.toLowerCase()) {
    case 'error': color = '#f00'; break;
    case 'warning': color = '#ff0'; break;
    case 'success': color = '#0ff'; break;
    case 'debug': color = '#888'; break;
  }
  
  entry.style.color = color;
  entry.textContent = `[${timestamp}] ${message}`;
  
  // Add to log and scroll to bottom
  debugLog.appendChild(entry);
  debugLog.scrollTop = debugLog.scrollHeight;
  
  // Also log to console
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function clearLog() {
  const debugLog = document.getElementById('debug-log');
  if (debugLog) {
    debugLog.innerHTML = '';
    addLogEntry('Log cleared');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const generateBtn = document.getElementById('generate-video-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const videoPreview = document.getElementById('video-preview');
  const previewImage = document.getElementById('preview-image');
  const playButtonContainer = document.getElementById('play-button-container');
  
  // Debug log elements
  const debugLogContainer = document.getElementById('debug-log-container');
  const toggleLogsBtn = document.getElementById('toggle-logs-btn');
  const debugLog = document.getElementById('debug-log');
  
  // Toggle debug logs visibility
  if (toggleLogsBtn && debugLog) {
    toggleLogsBtn.addEventListener('click', function() {
      if (debugLog.style.display === 'none') {
        debugLog.style.display = 'block';
        toggleLogsBtn.textContent = '▼';
      } else {
        debugLog.style.display = 'none';
        toggleLogsBtn.textContent = '▲';
      }
    });
  }
  
  // Initialize log
  addLogEntry('Debug logging initialized');
  
  // Tab Navigation
  const textBtn = document.getElementById('text-btn');
  const imageBtn = document.getElementById('image-btn');
  const audioBtn = document.getElementById('audio-btn');
  const captionsBtn = document.getElementById('captions-btn');
  const settingBtn = document.getElementById('setting-btn');
  
  // Tab Content
  const textTab = document.getElementById('text-tab');
  const imageTab = document.getElementById('image-tab');
  const audioTab = document.getElementById('audio-tab');
  const captionsTab = document.getElementById('captions-tab');
  const settingsTab = document.getElementById('settings-tab');
  
  // Form Elements
  const nicheInput = document.getElementById('niche');
  const languageSelect = document.getElementById('language');
  const textGenSelect = document.getElementById('text-gen');
  const textModelSelect = document.getElementById('text-model');
  const imageGenSelect = document.getElementById('image-gen');
  const imageModelSelect = document.getElementById('image-model');
  const ttsEngineSelect = document.getElementById('tts-engine');
  const ttsVoiceSelect = document.getElementById('tts-voice');
  const subtitleEnabledCheckbox = document.getElementById('subtitle-enabled');
  const highlightEnabledCheckbox = document.getElementById('highlight-enabled');
  const subtitleFontSelect = document.getElementById('subtitle-font');
  const fontSizeInput = document.getElementById('font-size');
  const textColorInput = document.getElementById('text-color');
  const highlightColorInput = document.getElementById('highlight-color');
  const strokeColorInput = document.getElementById('stroke-color');
  const subtitlePositionSelect = document.getElementById('subtitle-position');
  const musicFileSelect = document.getElementById('music-file');
  const musicVolumeInput = document.getElementById('music-volume');
  const autoUploadCheckbox = document.getElementById('auto-upload');
  
  // Output Elements
  const generatedTopic = document.getElementById('generated-topic');
  const generatedScript = document.getElementById('generated-script');
  const imagePrompts = document.getElementById('image-prompts');
  const videoTitle = document.getElementById('video-title');
  const videoDescription = document.getElementById('video-description');
  const imageGallery = document.querySelector('.image-gallery');
  const captionPreviewContainer = document.getElementById('caption-preview-container');
  
  // Current video generation ID
  let currentVideoId = null;
  let progressInterval = null;
  
  // Tab Navigation
  textBtn.addEventListener('click', function() {
    // Remove active class from all buttons and panes
    textBtn.classList.add('active');
    textTab.classList.add('active');
    imageBtn.classList.remove('active');
    imageTab.classList.remove('active');
    audioBtn.classList.remove('active');
    audioTab.classList.remove('active');
    captionsBtn.classList.remove('active');
    captionsTab.classList.remove('active');
    settingBtn.classList.remove('active');
    settingsTab.classList.remove('active');
  });
  
  imageBtn.addEventListener('click', function() {
    // Remove active class from all buttons and panes
    textBtn.classList.remove('active');
    textTab.classList.remove('active');
    imageBtn.classList.add('active');
    imageTab.classList.add('active');
    audioBtn.classList.remove('active');
    audioTab.classList.remove('active');
    captionsBtn.classList.remove('active');
    captionsTab.classList.remove('active');
    settingBtn.classList.remove('active');
    settingsTab.classList.remove('active');
  });
  
  audioBtn.addEventListener('click', function() {
    // Remove active class from all buttons and panes
    textBtn.classList.remove('active');
    textTab.classList.remove('active');
    imageBtn.classList.remove('active');
    imageTab.classList.remove('active');
    audioBtn.classList.add('active');
    audioTab.classList.add('active');
    captionsBtn.classList.remove('active');
    captionsTab.classList.remove('active');
    settingBtn.classList.remove('active');
    settingsTab.classList.remove('active');
  });
  
  captionsBtn.addEventListener('click', function() {
    // Remove active class from all buttons and panes
    textBtn.classList.remove('active');
    textTab.classList.remove('active');
    imageBtn.classList.remove('active');
    imageTab.classList.remove('active');
    audioBtn.classList.remove('active');
    audioTab.classList.remove('active');
    captionsBtn.classList.add('active');
    captionsTab.classList.add('active');
    settingBtn.classList.remove('active');
    settingsTab.classList.remove('active');
  });
  
  settingBtn.addEventListener('click', function() {
    // Remove active class from all buttons and panes
    textBtn.classList.remove('active');
    textTab.classList.remove('active');
    imageBtn.classList.remove('active');
    imageTab.classList.remove('active');
    audioBtn.classList.remove('active');
    audioTab.classList.remove('active');
    captionsBtn.classList.remove('active');
    captionsTab.classList.remove('active');
    settingBtn.classList.add('active');
    settingsTab.classList.add('active');
  });
  
  // Toggle collapsible sections
  window.toggleCollapsible = function(header) {
    const content = header.nextElementSibling;
    const isActive = header.classList.contains('active');
    
    // Remove active class
    if (isActive) {
      header.classList.remove('active');
      
      // Update icon to show section is closed
      const icon = header.querySelector('.toggle-icon');
      icon.textContent = '▼';
    } else {
      // Add active class
      header.classList.add('active');
      
      // Update icon to show section is open
      const icon = header.querySelector('.toggle-icon');
      icon.textContent = '▲';
    }
  };
  
  // Initialize collapsible sections
  const collapsibles = document.querySelectorAll('.collapsible .output-header');
  collapsibles.forEach(header => {
    header.nextElementSibling.style.display = 'none';
  });
  
  // Image count slider
  const imageCountSlider = document.getElementById('image-count');
  const imageCountValue = document.getElementById('image-count-value');
  if (imageCountSlider && imageCountValue) {
    imageCountSlider.addEventListener('input', function() {
      imageCountValue.textContent = this.value;
    });
  }
  
  // Preview voice button
  const previewVoiceBtn = document.getElementById('preview-voice-btn');
  if (previewVoiceBtn) {
    previewVoiceBtn.addEventListener('click', function() {
      alert('Voice preview not available in this demo.');
    });
  }
  
  // Preview music button
  const previewMusicBtn = document.getElementById('preview-music-btn');
  const previewAudio = document.getElementById('preview-audio');
  if (previewMusicBtn && previewAudio) {
    previewMusicBtn.addEventListener('click', function() {
      alert('Music preview not available in this demo.');
    });
  }

  // Platform connection buttons
  const connectionBtns = document.querySelectorAll('.connection-btn');
  connectionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const platform = this.getAttribute('data-platform');
      alert(`Connection to ${platform} not available in this demo.`);
    });
  });

  // Platform auto-upload buttons
  const autoUploadBtns = document.querySelectorAll('.auto-upload-btn');
  autoUploadBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const platform = this.getAttribute('data-platform');
      alert(`Auto-upload for ${platform} toggled.`);
      this.textContent = this.textContent === 'Enable Auto' ? 'Disable Auto' : 'Enable Auto';
    });
  });

  // Add event listeners for generator dropdowns
  if (textGenSelect && textModelSelect) {
    // Initial load of models
    updateModels(textGenSelect.value, textModelSelect, 'text');
    
    // Change event
    textGenSelect.addEventListener('change', function() {
      addLogEntry(`Text generator changed to: ${this.value}`, 'debug');
      updateModels(this.value, textModelSelect, 'text');
    });
  }
  
  if (imageGenSelect && imageModelSelect) {
    // Initial load of models
    updateModels(imageGenSelect.value, imageModelSelect, 'image');
    
    // Change event
    imageGenSelect.addEventListener('change', function() {
      addLogEntry(`Image generator changed to: ${this.value}`, 'debug');
      updateModels(this.value, imageModelSelect, 'image');
    });
  }
  
  if (ttsEngineSelect && ttsVoiceSelect) {
    // Initial load of models
    updateModels(ttsEngineSelect.value, ttsVoiceSelect, 'voice');
    
    // Change event
    ttsEngineSelect.addEventListener('change', function() {
      addLogEntry(`TTS engine changed to: ${this.value}`, 'debug');
      updateModels(this.value, ttsVoiceSelect, 'voice');
    });
  }
  
  // Add event listener for form submission
  if (generateBtn) {
    generateBtn.addEventListener('click', startVideoGeneration);
  }
  
  function startVideoGeneration() {
    // Validate form
    if (!nicheInput.value.trim()) {
      addLogEntry('Error: Topic/niche is required', 'error');
      alert('Please enter a topic or niche for the video.');
      return;
    }
    
    // Clear log
    clearLog();
    addLogEntry('Starting new video generation', 'info');
    
    // Collect form data
    const formData = {
      niche: nicheInput.value.trim(),
      language: languageSelect.value,
      text_gen: textGenSelect ? textGenSelect.value : 'g4f',
      text_model: textModelSelect ? textModelSelect.value : 'gpt-4',
      image_gen: imageGenSelect ? imageGenSelect.value : 'g4f',
      image_model: imageModelSelect ? imageModelSelect.value : 'flux',
      tts_engine: ttsEngineSelect ? ttsEngineSelect.value : 'edge',
      tts_voice: ttsVoiceSelect ? ttsVoiceSelect.value : 'en-US-AriaNeural',
      subtitles_enabled: subtitleEnabledCheckbox ? subtitleEnabledCheckbox.checked : true,
      highlighting_enabled: highlightEnabledCheckbox ? highlightEnabledCheckbox.checked : true,
      subtitle_font: subtitleFontSelect ? subtitleFontSelect.value : 'default',
      font_size: fontSizeInput ? fontSizeInput.value : 80,
      text_color: textColorInput ? textColorInput.value : '#ffffff',
      highlight_color: highlightColorInput ? highlightColorInput.value : '#0066ff',
      stroke_color: strokeColorInput ? strokeColorInput.value : '#000000',
      subtitle_position: subtitlePositionSelect ? subtitlePositionSelect.value : 'bottom',
      music_file: musicFileSelect ? musicFileSelect.value : 'random',
      music_volume: musicVolumeInput ? musicVolumeInput.value : 0.3,
      image_count: imageCountSlider ? imageCountSlider.value : 3,
      auto_upload: autoUploadCheckbox ? autoUploadCheckbox.checked : true
    };
    
    addLogEntry(`Video generation configuration:`, 'debug');
    addLogEntry(`- Topic: ${formData.niche}`, 'debug');
    addLogEntry(`- Language: ${formData.language}`, 'debug');
    addLogEntry(`- Text: ${formData.text_gen} / ${formData.text_model}`, 'debug');
    addLogEntry(`- Image: ${formData.image_gen} / ${formData.image_model}`, 'debug');
    addLogEntry(`- Voice: ${formData.tts_engine} / ${formData.tts_voice}`, 'debug');
    
    // Disable button
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    // Show progress bar
    progressBar.parentElement.style.display = 'block';
    progressText.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
    // Reset output areas
    generatedTopic.textContent = 'Generating...';
    generatedScript.textContent = 'Generating...';
    imagePrompts.textContent = 'Generating...';
    videoTitle.textContent = 'Generating...';
    videoDescription.textContent = 'Generating...';
    imageGallery.innerHTML = '<div style="width: 100%; text-align: center; color: #666; padding: 40px 0; background-color: #f5f5f5; border-radius: 10px;">Generating images...</div>';
    
    addLogEntry('Sending API request to generate video', 'info');
    
    // API call to start generation
    fetch('/videogenerator/api/generate_video/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        addLogEntry(`Video generation started with ID: ${data.video_id}`, 'success');
        // Store the video ID
        currentVideoId = data.video_id;
        
        // Start tracking progress
        startProgressTracking(currentVideoId);
      } else {
        addLogEntry(`Error starting video generation: ${data.error || 'Unknown error'}`, 'error');
        if (data.details) {
          addLogEntry(`Error details: ${data.details}`, 'error');
        }
        alert('Error: ' + (data.error || 'Failed to start video generation'));
        resetGenerationUI();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      addLogEntry(`Error: ${error.message}`, 'error');
      alert('Error: ' + error.message);
      resetGenerationUI();
    });
  }
  
  function startProgressTracking(videoId) {
    // Clear any existing interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    addLogEntry(`Starting progress tracking for video ID: ${videoId}`, 'info');
    
    // Enable cancel button
    generateBtn.disabled = false;
    generateBtn.textContent = 'Cancel Generation';
    generateBtn.className = 'cancel-btn';
    // Add a different style for the cancel button
    generateBtn.style.backgroundColor = '#d9534f';
    generateBtn.style.borderColor = '#d43f3a';
    
    // Override the onclick event to cancel the video generation
    generateBtn.onclick = function() {
      cancelVideoGeneration(videoId);
    };
    
    // Set up progress tracking
    progressInterval = setInterval(() => {
      fetch(`/videogenerator/api/progress/?video_id=${videoId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          updateProgress(data);
          
          // Update logs if available
          if (data.logs && data.logs.length > 0) {
            data.logs.forEach(log => {
              // Check if log already exists to avoid duplicates
              const existingLogs = Array.from(document.querySelectorAll('.log-entry')).map(el => el.textContent);
              if (!existingLogs.includes(log)) {
                // Determine log type based on log message
                let type = 'info';
                if (log.includes('[ERROR]')) type = 'error';
                else if (log.includes('[WARNING]')) type = 'warning';
                else if (log.includes('[SUCCESS]')) type = 'success';
                else if (log.includes('[DEBUG]')) type = 'debug';
                
                addLogEntry(log, type);
              }
            });
          }
          
          // If complete, failed or cancelled, stop polling
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            clearInterval(progressInterval);
            
            if (data.status === 'completed') {
              addLogEntry('Video generation completed successfully!', 'success');
              completeGeneration(data);
            } else if (data.status === 'cancelled') {
              addLogEntry('Video generation was cancelled by user.', 'warning');
              resetGenerationUI();
            } else {
              addLogEntry(`Video generation failed: ${data.error || 'Unknown error'}`, 'error');
              resetGenerationUI();
            }
          }
        })
        .catch(error => {
          console.error('Error checking progress:', error);
          addLogEntry(`Error checking progress: ${error.message}`, 'error');
        });
    }, 2000); // Check every 2 seconds
  }
  
  function cancelVideoGeneration(videoId) {
    addLogEntry('Cancelling video generation...', 'warning');
    
    fetch('/videogenerator/api/cancel_video/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ video_id: videoId })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        addLogEntry('Video generation cancelled successfully.', 'warning');
        
        // Reset the UI
        resetGenerationUI();
      } else {
        addLogEntry(`Error cancelling video generation: ${data.error || 'Unknown error'}`, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      addLogEntry(`Error cancelling: ${error.message}`, 'error');
    });
  }
  
  function updateProgress(data) {
    // Update progress bar
    const progress = Math.min(Math.round(data.progress * 100), 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    
    // Log progress update
    addLogEntry(`Progress: ${progress}%, Status: ${data.status}`, 'debug');
    
    // Update UI based on status
    switch (data.status) {
      case 'generating_topic':
        generatedTopic.textContent = 'Generating...';
        addLogEntry('Generating topic...', 'info');
        break;
      case 'generating_script':
        if (data.subject) {
          generatedTopic.textContent = data.subject;
          addLogEntry(`Generated topic: ${data.subject}`, 'info');
        }
        addLogEntry('Generating script...', 'info');
        break;
      case 'generating_metadata':
        if (data.script) {
          generatedScript.textContent = data.script;
          addLogEntry('Script generated', 'info');
        }
        addLogEntry('Generating metadata...', 'info');
        break;
      case 'generating_image_prompts':
        if (data.title) {
          videoTitle.textContent = data.title;
          addLogEntry(`Generated title: ${data.title}`, 'info');
        }
        if (data.description) {
          videoDescription.textContent = data.description;
          addLogEntry('Description generated', 'info');
        }
        addLogEntry('Generating image prompts...', 'info');
        break;
      case 'generating_images':
        if (data.image_prompts) {
          imagePrompts.textContent = data.image_prompts.join('\n\n');
          addLogEntry(`Generating ${data.image_prompts.length} images`, 'info');
        }
        break;
      case 'generating_speech':
        addLogEntry('Generating speech audio...', 'info');
        break;
      case 'generating_subtitles':
        addLogEntry('Generating subtitles...', 'info');
        break;
      case 'creating_video':
        addLogEntry('Creating final video...', 'info');
        break;
    }
  }
  
  function completeGeneration(data) {
    // Enable button
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Video';
    generateBtn.className = 'primary-btn';
    
    // Update UI
    progressText.textContent = 'Complete!';
    addLogEntry('Video generation completed!', 'success');
    
    // Show video
    if (data.video_url) {
      previewImage.style.display = 'none';
      videoPreview.src = data.video_url;
      videoPreview.style.display = 'block';
      
      addLogEntry(`Video available at: ${data.video_url}`, 'success');
      
      // Load and play the video
      videoPreview.load();
      videoPreview.play().catch(e => {
        console.error('Error playing video:', e);
        addLogEntry(`Error playing video: ${e.message}`, 'error');
      });
    }
    
    // Show success message
    alert('Video generation complete!');
  }
  
  function resetGenerationUI() {
    // Reset UI elements
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Video';
    generateBtn.className = 'primary-btn';
    // Reset button style
    generateBtn.style.backgroundColor = '';
    generateBtn.style.borderColor = '';
    // Reset onclick handler to the original function
    generateBtn.onclick = startVideoGeneration;
    
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    progressBar.parentElement.style.display = 'none';
    progressText.style.display = 'none';
    
    // Reset output areas
    generatedTopic.textContent = 'Generated topic will appear here';
    generatedScript.textContent = 'Generated script will appear here';
    imagePrompts.textContent = 'Generated image prompts will appear here';
    videoTitle.textContent = 'Generated title will appear here';
    videoDescription.textContent = 'Generated description will appear here';
    imageGallery.innerHTML = '<div style="width: 100%; text-align: center; color: #666; padding: 40px 0; background-color: #f5f5f5; border-radius: 10px;">Generated images will appear here</div>';
    
    addLogEntry('UI reset', 'info');
  }
  
  // Helper function to get cookie (for CSRF token)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Helper function to update models
  async function updateModels(generator, modelSelector, modelType) {
    try {
      // Show loading indicator
      modelSelector.innerHTML = '<option value="">Loading models...</option>';
      addLogEntry(`Fetching ${modelType} models for ${generator}...`, 'debug');
      
      // Fetch models from API
      const response = await fetch(`/videogenerator/api/get_models/?type=${modelType}&generator=${generator}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const models = await response.json();
      addLogEntry(`Received ${models.length} ${modelType} models for ${generator}`, 'debug');
      
      // Clear current options
      modelSelector.innerHTML = '';
      
      // Add new options
      if (models && models.length > 0) {
        models.forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model.charAt(0).toUpperCase() + model.slice(1).replace(/-/g, ' ');
          modelSelector.appendChild(option);
        });
      } else {
        // Add a default option if no models returned
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No models available";
        modelSelector.appendChild(option);
        addLogEntry(`No ${modelType} models found for ${generator}`, 'warning');
      }
    } catch (error) {
      console.error('Error updating models:', error);
      addLogEntry(`Error loading ${modelType} models: ${error.message}`, 'error');
      modelSelector.innerHTML = '<option value="">Error loading models</option>';
    }
  }

  // Add music upload functionality
  const uploadMusicButton = document.getElementById('upload-music-btn');
  const musicFileInput = document.getElementById('music-file-input');
  
  if (uploadMusicButton && musicFileInput) {
    uploadMusicButton.addEventListener('click', function() {
      musicFileInput.click();
    });
    
    musicFileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        uploadMusic(this.files[0]);
      }
    });
  }
  
  function uploadMusic(file) {
    addLogEntry(`Uploading music file: ${file.name}`, 'info');
    
    const formData = new FormData();
    formData.append('music_file', file);
    
    fetch('/videogenerator/api/upload_music/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        addLogEntry(`Music file uploaded successfully: ${data.filename}`, 'success');
        
        // Add the new music file to the select options
        const musicFileSelect = document.getElementById('music-file');
        const newOption = document.createElement('option');
        newOption.value = data.filename;
        newOption.textContent = data.filename;
        musicFileSelect.appendChild(newOption);
        
        // Select the newly uploaded file
        musicFileSelect.value = data.filename;
      } else {
        addLogEntry(`Error uploading music file: ${data.error || 'Unknown error'}`, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      addLogEntry(`Error uploading music: ${error.message}`, 'error');
    });
  }
  
  // Add font upload functionality
  const uploadFontButton = document.getElementById('upload-font-btn');
  const fontFileInput = document.getElementById('font-file-input');
  
  if (uploadFontButton && fontFileInput) {
    uploadFontButton.addEventListener('click', function() {
      fontFileInput.click();
    });
    
    fontFileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        uploadFont(this.files[0]);
      }
    });
  }
  
  function uploadFont(file) {
    addLogEntry(`Uploading font file: ${file.name}`, 'info');
    
    const formData = new FormData();
    formData.append('font_file', file);
    
    fetch('/videogenerator/api/upload_font/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        addLogEntry(`Font file uploaded successfully: ${data.font_name}`, 'success');
        
        // Add the new font to the select options
        const fontSelect = document.getElementById('subtitle-font');
        const newOption = document.createElement('option');
        newOption.value = data.font_name;
        newOption.textContent = data.font_name;
        fontSelect.appendChild(newOption);
        
        // Select the newly uploaded font
        fontSelect.value = data.font_name;
      } else {
        addLogEntry(`Error uploading font file: ${data.error || 'Unknown error'}`, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      addLogEntry(`Error uploading font: ${error.message}`, 'error');
    });
  }
});
