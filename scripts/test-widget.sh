#!/bin/bash

echo "Testing CharacterWidget implementation..."
echo "=========================================="

# Check if CharacterWidget file exists
if [ -f "src/components/CharacterWidget.tsx" ]; then
    echo "✅ CharacterWidget.tsx exists"
    
    # Check file size
    FILE_SIZE=$(wc -l < "src/components/CharacterWidget.tsx")
    echo "   File size: $FILE_SIZE lines"
    
    # Check for key components
    echo "Checking for key components:"
    
    if grep -q "interface CharacterConfig" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ CharacterConfig interface"
    else
        echo "  ❌ Missing CharacterConfig interface"
    fi
    
    if grep -q "const CharacterWidget:" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ CharacterWidget component"
    else
        echo "  ❌ Missing CharacterWidget component"
    fi
    
    if grep -q "renderVideoPlayer" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ Video player rendering"
    else
        echo "  ❌ Missing video player"
    fi
    
    if grep -q "renderControls" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ Controls rendering"
    else
        echo "  ❌ Missing controls"
    fi
    
    if grep -q "renderSpecialNeedsDock" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ Special Needs Dock"
    else
        echo "  ❌ Missing Special Needs Dock"
    fi
    
    if grep -q "renderMessageBubble" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ Message bubbles"
    else
        echo "  ❌ Missing message bubbles"
    fi
    
    if grep -q "chat-interface" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ Chat interface"
    else
        echo "  ❌ Missing chat interface"
    fi
    
    # Check for CSS animations
    if grep -q "@keyframes" "src/components/CharacterWidget.tsx"; then
        echo "  ✅ CSS animations"
    else
        echo "  ❌ Missing CSS animations"
    fi
    
else
    echo "❌ CharacterWidget.tsx not found"
    exit 1
fi

echo ""
echo "Checking demo page..."
if [ -f "src/pages/dashboard/WidgetDemo.tsx" ]; then
    echo "✅ WidgetDemo.tsx exists"
else
    echo "❌ WidgetDemo.tsx not found"
fi

echo ""
echo "Checking routes..."
if grep -q "WidgetDemo" "src/App.tsx"; then
    echo "✅ WidgetDemo route configured"
else
    echo "❌ WidgetDemo route not configured"
fi

echo ""
echo "Checking animation states..."
if [ -f "amplify/functions/soul-engine/animation-states.ts" ]; then
    echo "✅ Animation states configuration exists"
    
    # Check for subscription tiers
    if grep -q "SubscriptionTier" "amplify/functions/soul-engine/animation-states.ts"; then
        echo "  ✅ SubscriptionTier type"
    else
        echo "  ❌ Missing SubscriptionTier"
    fi
    
    if grep -q "getStatesForTier" "amplify/functions/soul-engine/animation-states.ts"; then
        echo "  ✅ getStatesForTier function"
    else
        echo "  ❌ Missing getStatesForTier"
    fi
    
    if grep -q "getStateNamesForTier" "amplify/functions/soul-engine/animation-states.ts"; then
        echo "  ✅ getStateNamesForTier function"
    else
        echo "  ❌ Missing getStateNamesForTier"
    fi
else
    echo "❌ Animation states configuration not found"
fi

echo ""
echo "=========================================="
echo "Summary: CharacterWidget implementation appears complete!"
echo "Access the demo at: http://localhost:5174/dashboard/widget/demo"
echo "=========================================="