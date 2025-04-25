document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const templateBtn = document.getElementById('templateBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const betaBtn = document.getElementById('betaBtn');
    const templateModal = document.getElementById('templateModal');
    const settingsModal = document.getElementById('settingsModal');
    const betaModal = document.getElementById('betaModal');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const sendToDiscord = document.getElementById('sendToDiscord');
    const saveSettings = document.getElementById('saveSettings');
    const closeButtons = document.querySelectorAll('.close');
    const templateCards = document.querySelectorAll('.template-card');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const notification = document.getElementById('notification');
    // Made by mindcreator9
    // Font and theme settings
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const theme = document.getElementById('theme');
    const previewFontFamily = document.getElementById('previewFontFamily');
    const previewTheme = document.getElementById('previewTheme');
    
    // State
    let currentTemplate = '';
    let userSettings = {
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        theme: 'light',
        previewFontFamily: 'Roboto, sans-serif',
        previewTheme: 'default'
    };
    
    // Initialize markdown renderer
    const renderer = new marked.Renderer();
    marked.setOptions({
        renderer: renderer,
        highlight: function(code, language) {
            return hljs.highlightAuto(code).value;
        },
        gfm: true,
        breaks: true,
        smartLists: true,
        smartypants: true
    });
    
    // Initialize with sample content or load from localStorage
    function initializeEditor() {
        const savedContent = localStorage.getItem('textMasterContent');
        const savedSettings = localStorage.getItem('textMasterSettings');
        
        if (savedContent) {
            editor.value = savedContent;
        } else {
            editor.value = '# Welcome to TEXTMASTER\n\nThe elegant Markdown editor for creating beautiful documents.\n\n## Features\n\n- Real-time preview\n- Customizable themes and fonts\n- Template library\n- Discord webhook integration\n- Export options\n\n*Start typing to see your content come to life!*';
        }
        
        if (savedSettings) {
            userSettings = JSON.parse(savedSettings);
            applySettings();
        }
        
        updatePreview();
    }
    
    // Update preview with markdown content
    function updatePreview() {
        const content = editor.value;
        preview.innerHTML = marked.parse(content);
        hljs.highlightAll();
        
        // Save content to localStorage
        localStorage.setItem('textMasterContent', content);
    }
    
    // Apply user settings
    function applySettings() {
        // Update editor styles
        editor.style.fontFamily = userSettings.fontFamily;
        editor.style.fontSize = userSettings.fontSize;
        
        // Update preview styles
        preview.style.fontFamily = userSettings.previewFontFamily;
        
        // Remove all theme classes and add current theme
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
        document.body.classList.add('theme-' + userSettings.theme);
        
        // Update preview theme
        preview.className = 'preview-content ' + userSettings.previewTheme;
        
        // Update settings form values
        fontFamily.value = userSettings.fontFamily;
        fontSize.value = parseInt(userSettings.fontSize);
        fontSizeValue.textContent = userSettings.fontSize;
        theme.value = userSettings.theme;
        previewFontFamily.value = userSettings.previewFontFamily;
        previewTheme.value = userSettings.previewTheme;
        
        // Save settings to localStorage
        localStorage.setItem('textMasterSettings', JSON.stringify(userSettings));
    }
    
    // Show notification
    function showNotification(message, type = '') {
        notification.textContent = message;
        notification.className = 'notification show ' + type;
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }
    
    // Event Listeners
    editor.addEventListener('input', updatePreview);
    
    // Open modals
    templateBtn.addEventListener('click', () => {
        templateModal.style.display = 'block';
    });
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
    
    betaBtn.addEventListener('click', () => {
        betaModal.style.display = 'block';
    });
    
    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            templateModal.style.display = 'none';
            settingsModal.style.display = 'none';
            betaModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === templateModal) templateModal.style.display = 'none';
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === betaModal) betaModal.style.display = 'none';
    });
    
    // Apply templates
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const templateName = card.getAttribute('data-template');
            loadTemplate(templateName);
            templateModal.style.display = 'none';
        });
    });
    
    // Toolbar functionality
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            const param = button.getAttribute('data-param') || '';
            executeCommand(command, param);
        });
    });
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        copyToClipboard(editor.value);
        showNotification('Markdown copied to clipboard!', 'success');
    });
    
    // Download button
    downloadBtn.addEventListener('click', () => {
        downloadMarkdown(editor.value);
    });
    
    // Save settings
    saveSettings.addEventListener('click', () => {
        userSettings.fontFamily = fontFamily.value;
        userSettings.fontSize = fontSize.value + 'px';
        userSettings.theme = theme.value;
        userSettings.previewFontFamily = previewFontFamily.value;
        userSettings.previewTheme = previewTheme.value;
        
        applySettings();
        settingsModal.style.display = 'none';
        showNotification('Settings saved!', 'success');
    });
    
    // Font size slider update
    fontSize.addEventListener('input', () => {
        fontSizeValue.textContent = fontSize.value + 'px';
    });
    
    // Send to Discord webhook
    sendToDiscord.addEventListener('click', () => {
        const webhookUrl = document.getElementById('webhookUrl').value;
        const username = document.getElementById('username').value || 'TEXTMASTER Bot';
        const messageTitle = document.getElementById('messageTitle').value || 'New Markdown Message';
        
        if (!webhookUrl) {
            showNotification('Please enter a webhook URL!', 'error');
            return;
        }
        
        sendToDiscordWebhook(webhookUrl, username, messageTitle, editor.value);
    });
    
    // Functions
    
    // Execute toolbar commands
    function executeCommand(command, param) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        let replacement = '';
        
        switch (command) {
            case 'bold':
                replacement = `**${selectedText || 'bold text'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'italic text'}*`;
                break;
            case 'heading':
                const headingLevel = '#'.repeat(parseInt(param));
                replacement = `${headingLevel} ${selectedText || 'Heading'}`;
                break;
            case 'link':
                replacement = selectedText ? `[${selectedText}](url)` : '[link text](url)';
                break;
            case 'image':
                replacement = `![${selectedText || 'alt text'}](image-url)`;
                break;
                // Made by mindcreator9
            case 'list-ul':
                if (selectedText) {
                    replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
                } else {
                    replacement = '- List item\n- List item\n- List item';
                }
                break;
            case 'list-ol':
                if (selectedText) {
                    replacement = selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n');
                } else {
                    replacement = '1. List item\n2. List item\n3. List item';
                }
                break;
            case 'quote':
                if (selectedText) {
                    replacement = selectedText.split('\n').map(line => `> ${line}`).join('\n');
                } else {
                    replacement = '> Blockquote text';
                }
                break;
            case 'code':
                replacement = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\ncode block\n```';
                break;
            case 'table':
                replacement = '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |';
                break;
            case 'horizontal-rule':
                replacement = '\n---\n';
                break;
            case 'clear':
                editor.value = '';
                updatePreview();
                return;
        }
        
        // Replace selected text with new content
        editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
        
        // Update cursor position
        editor.selectionStart = start + replacement.length;
        editor.selectionEnd = start + replacement.length;
        
        // Focus back on editor
        editor.focus();
        
        // Update preview
        updatePreview();
    }
    
    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Could not copy text: ', err);
            showNotification('Failed to copy to clipboard', 'error');
        });
    }
    
    // Download markdown file
    function downloadMarkdown(text) {
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'textmaster-document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Document downloaded!', 'success');
    }
    
    // Load template
    function loadTemplate(templateName) {
        let templateContent = '';
        
        switch (templateName) {
            case 'readme':
                templateContent = `# Project Title

## Description
A brief description of what this project does and who it's for.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
npm install my-project
\`\`\`

## Usage
\`\`\`javascript
import { myFunction } from 'my-project';

// Example usage
myFunction();
\`\`\`

## API Reference
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| \`api_key\` | \`string\` | **Required**. Your API key |

## Contributing
Contributions are always welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)`;
                break;
                
            case 'meeting':
                templateContent = `# Meeting Notes

## Date: ${new Date().toLocaleDateString()}
## Participants
- Person 1
- Person 2
- Person 3

## Agenda
1. Topic 1
2. Topic 2
3. Topic 3

## Discussion Points
### Topic 1
- Main discussion points
- Decisions made

### Topic 2
- Main discussion points
- Decisions made

## Action Items
- [ ] Action 1 - Assigned to: Person 1, Due: Date
- [ ] Action 2 - Assigned to: Person 2, Due: Date

## Next Meeting
Date: TBD`;
                break;
                
            case 'blog':
                templateContent = `# Title of the Blog Post

*Published on ${new Date().toLocaleDateString()} by Author Name*

![Featured Image](image-url)

## Introduction
A captivating introduction to your blog post that hooks the reader and gives them a reason to continue reading.

## Main Section 1
Your content here. Add insights, facts, personal experiences, or anything relevant to your topic.

### Subsection
Dive deeper into specific aspects of your topic.

## Main Section 2
Continue developing your ideas with clear reasoning and supporting evidence.

> "Add a relevant quote here that supports your point" - Famous Person

## Conclusion
Summarize your main points and leave the reader with a thought-provoking closing statement.

---

*If you enjoyed this article, consider sharing it with others who might find it useful.*`;
                break;
                
            case 'documentation':
                templateContent = `# Documentation Title

## Overview
Brief description of what this documentation covers.

## Getting Started
### Prerequisites
- Requirement 1
- Requirement 2

### Installation
Step-by-step installation guide:

1. Step one
   \`\`\`bash
   command to execute
   \`\`\`
2. Step two
   \`\`\`bash
   another command
   \`\`\`

## Main Concepts
### Concept 1
Explanation of concept 1.

### Concept 2
Explanation of concept 2.

## API Reference
### Function Name
\`\`\`typescript
function functionName(param1: string, param2: number): ReturnType
\`\`\`

**Parameters:**
- \`param1\` (string): Description of param1
- \`param2\` (number): Description of param2

**Returns:**
- ReturnType: Description of return value

## Troubleshooting
Common issues and their solutions:

### Issue 1
Solution to issue 1.

### Issue 2
Solution to issue 2.

## FAQ
**Q: Frequently asked question?**  
A: Answer to the question.

## Version History
- v1.0.0 - Initial release
- v1.1.0 - Feature added`;
                break;
                
            case 'project':
                templateContent = `# Project Plan

## Project Overview
Brief description of the project, its goals, and expected outcomes.

## Team Members
- Name 1 - Role
- Name 2 - Role
- Name 3 - Role

## Timeline
| Phase | Start Date | End Date | Status |
|-------|------------|----------|--------|
| Planning | Date | Date | Status |
| Implementation | Date | Date | Status |
| Testing | Date | Date | Status |
| Deployment | Date | Date | Status |

## Objectives
1. Primary objective
2. Secondary objective
3. Additional objectives

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

## Resources Required
- Resource 1
- Resource 2
- Resource 3

## Risk Assessment
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Risk 1 | Low/Med/High | Low/Med/High | Strategy |
| Risk 2 | Low/Med/High | Low/Med/High | Strategy |

## Budget
| Item | Cost | Notes |
|------|------|-------|
| Item 1 | $XXX | Description |
| Item 2 | $XXX | Description |
| Total | $XXX | |

## Success Criteria
- Criterion 1
- Criterion 2
- Criterion 3`;
                break;
                
            case 'elegant':
                templateContent = `# *Jane Doe*

> *"A quote that represents your philosophy or approach to life"*

## About Me

With a passion for excellence and an eye for detail, I bring creativity and analytical thinking to every project. My journey has taken me through various challenges that have shaped my unique perspective and problem-solving abilities.

## Experience

**Company Name** | *Position Title*  
Jan 2020 - Present
- Accomplishment 1
- Accomplishment 2
- Accomplishment 3

**Previous Company** | *Previous Role*  
Jan 2018 - Dec 2019
- Accomplishment 1
- Accomplishment 2

## Education

**University Name**  
*Degree in Subject*  
Year - Year

## Skills

*Technical Skills*: Skill 1, Skill 2, Skill 3  
*Soft Skills*: Skill 1, Skill 2, Skill 3

## Portfolio

### Project Name
![Project Image](image-url)

Brief description of the project, highlighting key achievements and technologies used.

### Another Project
![Project Image](image-url)

Brief description of the project, highlighting key achievements and technologies used.

## Contact

📧 email@example.com  
🔗 [LinkedIn](https://linkedin.com/in/username)  
🌐 [Personal Website](https://example.com)

---

*"A closing quote or statement that leaves a lasting impression"*`;
                break;
        }
        
        editor.value = templateContent;
        updatePreview();
        showNotification(`${templateName.charAt(0).toUpperCase() + templateName.slice(1)} template loaded!`, 'success');
    }
    
    // Send to Discord webhook
    async function sendToDiscordWebhook(webhookUrl, username, title, content) {
        try {
            const payload = {
                username: username,
                content: `**${title}**\n\n${content}`
            };
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (response.ok) {
                showNotification('Successfully sent to Discord!', 'success');
                betaModal.style.display = 'none';
            } else {
                throw new Error('Failed to send to Discord webhook');
            }
        } catch (error) {
            console.error('Error sending to Discord:', error);
            showNotification('Failed to send to Discord webhook. Check the URL and try again.', 'error');
        }
    }
    
    // Initialize
    initializeEditor();
});

// This file contains template definitions for TEXTMASTER
// Can be used to extend the template library with more options

const templates = {
    // Academic templates
    'academic-paper': `# Title of the Academic Paper

**Author:** Your Name  
**Affiliation:** Your Institution  
**Date:** ${new Date().toLocaleDateString()}

## Abstract

Provide a brief summary of your paper, highlighting the main research question, methodology, findings, and conclusions.

## Introduction

### Background
Provide context for your research and explain why it's important.

### Research Question
Clearly state the primary research question or objective of your study.

### Literature Review
Summarize previous research related to your topic.

## Methodology

### Research Design
Describe the overall approach to your research.

### Data Collection
Explain how you collected the data for your study.

### Data Analysis
Detail the methods used to analyze your data.

## Results

Present your findings in a clear and organized manner. Consider using tables or figures:

| Variable | Group A | Group B | p-value |
|----------|---------|---------|---------|
| Variable 1 | Value | Value | p<0.05 |
| Variable 2 | Value | Value | p>0.05 |

## Discussion

### Interpretation of Results
Explain what your results mean in the context of your research question.

### Limitations
Acknowledge the limitations of your study.

### Implications
Discuss the theoretical and practical implications of your findings.

## Conclusion

Summarize your main findings and their significance. Suggest directions for future research.

## References

- Author, A. (Year). Title of work. Publisher. DOI/URL
- Author, B. (Year). Title of work. Publisher. DOI/URL
- Author, C. (Year). Title of work. Publisher. DOI/URL`,

    'business-proposal': `# Business Proposal: [Project Name]

**Prepared by:** [Your Name/Company]
**Prepared for:** [Client/Company Name]
**Date:** ${new Date().toLocaleDateString()}

## Executive Summary

A concise overview of the proposal, including the problem statement, proposed solution, benefits, and costs.

## Company Background

### About Us
Brief description of your company, including history, mission, and relevant expertise.

### Team
Key team members and their qualifications:

- **Name, Position** - Brief bio and relevant experience
- **Name, Position** - Brief bio and relevant experience

## Problem Statement

Clearly define the problem or opportunity that your proposal addresses.

## Proposed Solution

### Overview
High-level description of your proposed solution.

### Features & Benefits
- Feature 1: Description and benefits
- Feature 2: Description and benefits
- Feature 3: Description and benefits

### Implementation Plan
Step-by-step approach to implementing the solution:

1. Phase 1: Description and timeline
2. Phase 2: Description and timeline
3. Phase 3: Description and timeline

## Financial Analysis

### Cost Breakdown
| Item | Cost | Notes |
|------|------|-------|
| Item 1 | $XXX | Description |
| Item 2 | $XXX | Description |
| Total | $XXX | |

### ROI Analysis
Projected return on investment:

- Year 1: $XXX (X%)
- Year 2: $XXX (X%)
- Year 3: $XXX (X%)

## Timeline

| Milestone | Date | Deliverables |
|-----------|------|-------------|
| Milestone 1 | Date | Deliverables |
| Milestone 2 | Date | Deliverables |
| Milestone 3 | Date | Deliverables |

## Terms & Conditions

Key terms including payment schedule, warranties, and legal considerations.

## Next Steps

Clear call to action for moving forward with the proposal.

## Appendices

Any additional supporting information, case studies, or testimonials.`,

    // Creative templates
    'story-outline': `# Story Outline: [Title]

## Basic Information

**Genre:** [Genre]
**Target Audience:** [Audience]
**Word Count Target:** [Word Count]

## Premise

One-paragraph summary of your story's core concept.

## Characters

### Main Character
- **Name:** [Name]
- **Age:** [Age]
- **Occupation:** [Occupation]
- **Physical Description:** Brief description
- **Personality:** Key traits
- **Goal:** What they want
- **Motivation:** Why they want it
- **Conflict:** What stands in their way
- **Arc:** How they change

### Supporting Character 1
- **Name:** [Name]
- **Relationship to Main Character:** [Relationship]
- **Goal:** What they want
- **Contribution to Story:** How they affect the plot

### Antagonist
- **Name:** [Name]
- **Goal:** What they want
- **Motivation:** Why they oppose the protagonist
- **Strength:** What makes them formidable

## Setting

### Primary Location
- **Name:** [Location Name]
- **Description:** Brief sensory description
- **Significance:** How it impacts the story

### Time Period
- **Era:** [Time Period]
- **Significant Elements:** Important contextual details

## Plot Structure

### Act 1: Setup
- **Opening Scene:** How the story begins
- **Inciting Incident:** Event that sets the story in motion
- **First Plot Point:** Character commits to the journey

### Act 2: Confrontation
- **Rising Action:** Escalating challenges
- **Midpoint:** Major turning point/revelation
- **Complications:** Increasing difficulties
- **Low Point:** All seems lost

### Act 3: Resolution
- **Climax:** Final confrontation
- **Resolution:** Aftermath and new normal
- **Final Image:** Lasting impression

## Themes

- Theme 1: Brief explanation
- Theme 2: Brief explanation

## Key Scenes

1. **Scene Name:** Brief description of important scene
2. **Scene Name:** Brief description of important scene
3. **Scene Name:** Brief description of important scene

## Notes

Additional ideas, research needed, or questions to consider.`,

    // Technical templates
    'api-documentation': `# API Documentation

## Overview

Brief description of what this API does and what problems it solves.

## Base URL

\`\`\`
https://api.xd.com/v1
\`\`\`

## Authentication

Describe authentication methods:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Rate Limiting

Information about rate limits:

- Rate limit: 100 requests per minute
- Exceeded: 429 Too Many Requests response

## Endpoints

### Get Resource

\`\`\`http
GET /resources
\`\`\`

Retrieves a list of resources.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Maximum number of resources to return (default: 20) |
| offset | integer | No | Number of resources to skip (default: 0) |
| sort | string | No | Field to sort by (default: id) |

**Response:**

\`\`\`json
{
  "data": [
    {
      "id": "resource_id",
      "name": "Resource Name",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "metadata": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
\`\`\`

### Create Resource

\`\`\`http
POST /resources
\`\`\`

Creates a new resource.

**Request Body:**

\`\`\`json
{
  "name": "New Resource",
  "description": "Description of the resource"
}
\`\`\`

**Response:**

\`\`\`json
{
  "id": "new_resource_id",
  "name": "New Resource",
  "description": "Description of the resource",
  "created_at": "2023-01-01T00:00:00Z"
}
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - The request was malformed |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - You don't have permission |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong |


## Changelog

### v1.2 (2023-03-15)
- Added new endpoint for batch operations
- Improved rate limiting

### v1.1 (2023-01-10)
- Fixed bug in authentication
- Added sorting options

### v1.0 (2023-01-01)
- Initial release`
};

// Export templates to be used in the main script
if (typeof module !== 'undefined') {
    module.exports = templates;
}

// Discord Webhook Integration for TEXTMASTER

class DiscordWebhook {
    constructor() {
        this.webhookUrl = '';
        this.username = 'TEXTMASTER Bot';
        this.avatarUrl = '';
        this.message = '';
        this.title = '';
    }
// Made by mindcreator9
    /**
     * Sets the Discord webhook URL
     * @param {string} url - The webhook URL
     * @returns {DiscordWebhook} - The instance for chaining
     */
    setWebhookUrl(url) {
        this.webhookUrl = url;
        return this;
    }

    /**
     * Sets the username to display with the message
     * @param {string} username - The username
     * @returns {DiscordWebhook} - The instance for chaining
     */
    setUsername(username) {
        this.username = username || 'TEXTMASTER Bot';
        return this;
    }

    /**
     * Sets the avatar URL
     * @param {string} url - The avatar image URL
     * @returns {DiscordWebhook} - The instance for chaining
     */
    setAvatarUrl(url) {
        this.avatarUrl = url;
        return this;
    }

    /**
     * Sets the message content
     * @param {string} message - The markdown message
     * @returns {DiscordWebhook} - The instance for chaining
     */
    setMessage(message) {
        this.message = message;
        return this;
    }

    /**
     * Sets the message title
     * @param {string} title - The message title
     * @returns {DiscordWebhook} - The instance for chaining
     */
    setTitle(title) {
        this.title = title;
        return this;
    }

    /**
     * Validates the webhook data
     * @returns {boolean} - True if valid, throws error if invalid
     */
    validate() {
        if (!this.webhookUrl) {
            throw new Error('Webhook URL is required');
        }
        
        if (!this.webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
            throw new Error('Invalid Discord webhook URL format');
        }
        
        if (!this.message) {
            throw new Error('Message content is required');
        }
        
        return true;
    }

    /**
     * Formats the message for Discord
     * @returns {Object} - Formatted payload
     */
    formatPayload() {
        // Format the message with proper Discord markdown
        let content = this.message;
        
        // Add title if provided
        if (this.title) {
            content = `**${this.title}**\n\n${content}`;
        }
        
        const payload = {
            content: content,
            username: this.username
        };
        
        if (this.avatarUrl) {
            payload.avatar_url = this.avatarUrl;
        }
        
        return payload;
    }

    /**
     * Sends the webhook to Discord
     * @returns {Promise} - Promise that resolves with response or rejects with error
     */
    async send() {
        try {
            this.validate();
            
            const payload = this.formatPayload();
            
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Discord webhook error (${response.status}): ${errorData.message || 'Unknown error'}`);
            }
            
            return {
                success: true,
                status: response.status,
                statusText: response.statusText
            };
        } catch (error) {
            console.error('Discord webhook error:', error);
            throw error;
        }
    }
    
    /**
     * Formats Markdown content for Discord compatibility
     * @param {string} markdown - Original markdown content
     * @returns {string} - Discord-compatible markdown
     */
    static formatMarkdown(markdown) {
        if (!markdown) return '';
        
        // Discord uses slightly different markdown syntax than standard
        // Make necessary adjustments here
        let discordMarkdown = markdown;
        
        // Fix code blocks if needed
        discordMarkdown = discordMarkdown.replace(/```(\w+)\n/g, '```$1\n');
        
        // Fix any other incompatibilities
        
        return discordMarkdown;
    }
    
    /**
     * Creates and sends a webhook in one step
     * @param {Object} options - Webhook options
     * @param {string} options.url - Webhook URL
     * @param {string} options.username - Display name
     * @param {string} options.message - Message content
     * @param {string} options.title - Message title
     * @returns {Promise} - Promise that resolves with response
     */
    static async quickSend(options) {
        const webhook = new DiscordWebhook();
        
        webhook
            .setWebhookUrl(options.url)
            .setUsername(options.username)
            .setMessage(options.message);
            
        if (options.title) {
            webhook.setTitle(options.title);
        }
        
        if (options.avatarUrl) {
            webhook.setAvatarUrl(options.avatarUrl);
        }
        
        return webhook.send();
    }
}

// Export the class if used in a module environment
if (typeof module !== 'undefined') {
    module.exports = DiscordWebhook;
}

/**
 * Utility functions for TEXTMASTER application
 */

const TextMasterUtils = {
    /**
     * Debounces a function call
     * @param {Function} func - The function to debounce
     * @param {number} wait - The time to wait in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Gets cursor position in textarea
     * @param {HTMLTextAreaElement} textarea - The textarea element
     * @returns {Object} - Object with line and column properties
     */
    getCursorPosition(textarea) {
        const position = textarea.selectionStart;
        const value = textarea.value.substring(0, position);
        const lines = value.split('\n');
        const lineCount = lines.length;
        const charCount = lines[lineCount - 1].length;
        
        return {
            line: lineCount,
            column: charCount
        };
    },

    /**
     * Inserts text at cursor position
     * @param {HTMLTextAreaElement} textarea - The textarea element
     * @param {string} text - Text to insert
     */
    insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        
        textarea.value = before + text + after;
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
    },

    /**
     * Creates downloadable file from content
     * @param {string} content - File content
     * @param {string} filename - Name for the file
     * @param {string} type - MIME type
     */
    downloadFile(content, filename, type = 'text/markdown') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Saves content to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     */
    saveToStorage(key, data) {
        try {
            const serialized = typeof data === 'object' ? JSON.stringify(data) : data;
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    /**
     * Gets content from localStorage
     * @param {string} key - Storage key
     * @param {boolean} parse - Whether to parse JSON
     * @returns {*} - Retrieved data
     */
    getFromStorage(key, parse = false) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return null;
            return parse ? JSON.parse(data) : data;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    /**
     * Applies syntax highlighting to code blocks
     * @param {string} content - HTML content
     * @returns {string} - Content with highlighted code
     */
    highlightCodeBlocks(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        const codeBlocks = tempDiv.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
        });
        
        return tempDiv.innerHTML;
    },

    /**
     * Converts RGB to Hex color
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} - Hex color code
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b]
            .map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('');
    },

    /**
     * Converts Hex to RGB color
     * @param {string} hex - Hex color code
     * @returns {Object|null} - RGB color object or null if invalid
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Gets word count from text
     * @param {string} text - Text to count words in
     * @returns {number} - Word count
     */
    getWordCount(text) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    },

    /**
     * Gets character count from text
     * @param {string} text - Text to count characters in
     * @param {boolean} countSpaces - Whether to count spaces
     * @returns {number} - Character count
     */
    getCharCount(text, countSpaces = true) {
        return countSpaces ? text.length : text.replace(/\s/g, '').length;
    },

    /**
     * Formats a date in a readable way
     * @param {Date} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    /**
     * Sanitizes HTML content
     * @param {string} html - HTML content to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHtml(html) {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = html;
        return tempDiv.innerHTML;
    },

    /**
     * Detects the operating system
     * @returns {string} - OS name
     */
    detectOS() {
        const userAgent = window.navigator.userAgent;
        
        if (userAgent.indexOf('Windows') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        
        return 'Unknown';
    },
    
    /**
     * Detects dark mode preference
     * @returns {boolean} - True if dark mode preferred
     */
    prefersDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
};

// Export if used in a module environment
if (typeof module !== 'undefined') {
    module.exports = TextMasterUtils;
}
// Made by mindcreator9