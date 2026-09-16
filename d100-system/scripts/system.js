Hooks.once('init', () => {
  console.log('D100 System | Initializing custom d100 system...');

  const systemData = {
    name: 'd100-system',
    label: 'D100 System'
  };

  game.d100System = systemData;

  // ---------------------------------------------------------------------
  // Condition registry
  // Each condition is applied to an actor as an ActiveEffect carrying
  // flags['d100-system'].condition (the key below) and, for stackable
  // conditions, flags['d100-system'].stacks (an integer >= 1).
  // ---------------------------------------------------------------------
  const CONDITION_DEFS = {
    bleeding: {
      key: 'bleeding', label: 'Bleeding', icon: 'icons/svg/blood.svg', stackable: true,
      description: 'At the start of your turn, take 1d4 direct Slashing or Piercing damage per stack. A Major Action Medicine Check removes all stacks on success.',
      dot: { die: 'd4', damageType: 'slashing' }
    },
    blinded: {
      key: 'blinded', label: 'Blinded', icon: 'icons/svg/blind.svg', stackable: true,
      description: 'Attack Checks and Reactions (and, at DM discretion, some Saves) are made with 3 Swords per rank.',
      ownSwordsPerStack: 3
    },
    burning: {
      key: 'burning', label: 'Burning', icon: 'icons/svg/fire.svg', stackable: true,
      description: 'At the start of your turn, take 1d6 direct Fire damage per stack. Spend 2 Movement to Stop, Drop & Roll and remove all stacks.',
      dot: { die: 'd6', damageType: 'fire' }
    },
    charmed: {
      key: 'charmed', label: 'Charmed', icon: 'icons/svg/eye.svg', stackable: false,
      description: 'You see enemies as friends. Enemies interacting with you get 10 Songs to Checks. End of turn: Observation or Majesty Save (DM choice) ends the condition.',
      endOfTurnSave: { attribute: null, removesAll: true, label: 'Observation or Majesty (DM choice)' }
    },
    cursed: {
      key: 'cursed', label: 'Cursed', icon: 'icons/svg/sun.svg', stackable: true,
      description: 'The first time you fail a Check or Save each turn, take direct damage (Defense does not apply, Resistances do). Removal is condition-specific. Damage must be triggered manually by the DM.',
      manualTrigger: true
    },
    dazed: {
      key: 'dazed', label: 'Dazed', icon: 'icons/svg/daze.svg', stackable: true,
      description: 'Movement is reduced by 3 per stack. Only a Major Action or a Quick Action may be taken this turn, not both. End of turn: remove one rank automatically, then make an Observation Save to remove another.',
      movementPenaltyPerStack: 3,
      endOfTurnSave: { attribute: 'observation', removesAll: false, autoRemoveOne: true }
    },
    deafened: {
      key: 'deafened', label: 'Deafened', icon: 'icons/svg/deaf.svg', stackable: false,
      description: 'Checks and Saves requiring hearing are made with 10 Swords. Abilities requiring you to hear them do not affect you.',
      ownSwordsPerStack: 10
    },
    dying: {
      key: 'dying', label: 'Dying', icon: 'icons/svg/skull.svg', stackable: false,
      description: 'Roll a Toughness Save (10 Swords if caused by a Critical Hit) to remain conscious. If struck again at 0 Health, roll for an additional Scar.',
      autoApplyAtZeroHealth: true
    },
    frightened: {
      key: 'frightened', label: 'Frightened', icon: 'icons/svg/terror.svg', stackable: true,
      description: '5 Swords to Checks per stack. End of turn: Majesty Save removes 1 + Degrees of Success stacks.',
      ownSwordsPerStack: 5,
      endOfTurnSave: { attribute: 'majesty', removesAll: false, removeByDegrees: true }
    },
    grappled: {
      key: 'grappled', label: 'Grappled', icon: 'icons/svg/net.svg', stackable: true,
      description: 'Movement is 0. Use your Quick Action to make a Strength or Reflex Check to break free (3 Swords per stack beyond the first).',
      movementOverrideZero: true
    },
    paralyzed: {
      key: 'paralyzed', label: 'Paralyzed', icon: 'icons/svg/paralysis.svg', stackable: false,
      description: 'Movement is 0. Attacks against you get 3 Songs and melee hits are automatic Critical Hits. You automatically fail Strength and Reflex Saves.',
      movementOverrideZero: true,
      autoFailSaves: ['strength', 'reflex'],
      attackerSongsAgainstMelee: 3,
      attackerSongsAgainstRanged: 3
    },
    poisoned: {
      key: 'poisoned', label: 'Poisoned', icon: 'icons/svg/poison.svg', stackable: true,
      description: 'Take 1d4 direct Poison damage per stack at the start of your turn. End of turn: a successful Toughness Save removes all stacks.',
      dot: { die: 'd4', damageType: 'poison' },
      endOfTurnSave: { attribute: 'toughness', removesAll: true }
    },
    prone: {
      key: 'prone', label: 'Prone', icon: 'icons/svg/falling.svg', stackable: false,
      description: 'Costs 2 Movement to stand. Melee attacks against you get 10 Songs and deal an extra die of damage on a hit. Ranged attacks against you get 10 Swords, unless the attacker is elevated and close (DM discretion).',
      attackerSongsAgainstMelee: 10,
      attackerSwordsAgainstRanged: 10
    },
    restrained: {
      key: 'restrained', label: 'Restrained', icon: 'icons/svg/net.svg', stackable: true,
      description: 'Checks (other than breaking free) are made with 3 Swords per stack. Movement is 0. Breaking free uses your Major Action. Attacks against you get 5 Songs.',
      ownSwordsPerStack: 3,
      movementOverrideZero: true,
      attackerSongsAgainstMelee: 5,
      attackerSongsAgainstRanged: 5
    },
    slowed: {
      key: 'slowed', label: 'Slowed', icon: 'icons/svg/frozen.svg', stackable: true,
      description: 'Movement is reduced by 1 per stack. If Movement is reduced to 0, you fall Prone.',
      movementPenaltyPerStack: 1,
      fallsProneAtZeroMovement: true
    },
    unconscious: {
      key: 'unconscious', label: 'Unconscious', icon: 'icons/svg/unconscious.svg', stackable: false,
      description: 'Observation and Majesty Saves, and Reflex Saves against being Ambushed, are made with 15 Swords. Melee attacks against you are automatic Critical Hits and wake you.',
      ownSwordsPerStack: 15
    },
    vexed: {
      key: 'vexed', label: 'Vexed', icon: 'icons/svg/silenced.svg', stackable: false,
      description: 'You cannot cast Spells until this condition is removed.',
      blocksSpellcasting: true
    },
    hidden: {
      key: 'hidden', label: 'Hidden', icon: 'icons/svg/invisible.svg', stackable: false,
      description: 'Gain 5 Songs on Checks enhanced by being unseen. Making an Attack Check immediately reveals you.',
      ownSongsPerStack: 5,
      revealedByAttack: true
    },
    concentration: {
      key: 'concentration', label: 'Concentration', icon: 'icons/svg/aura.svg', stackable: false,
      description: 'You are Concentrating on a Spell or Weapon Technique. If you take damage meeting or exceeding a level-based threshold in a single hit, you must succeed a Toughness Check using a Weapon or Magic Skill to maintain it. You may end Concentration voluntarily at any time — just let the DM know.'
    }
  };
  const CONDITION_LIST = Object.values(CONDITION_DEFS);

  const coreStatusEffects = CONFIG.statusEffects;
  const keptCoreStatusEffects = coreStatusEffects.filter((effect) => ['dead', 'invisible'].includes(effect.id));

  CONFIG.statusEffects = [
    ...CONDITION_LIST.map((condition) => ({
      id: condition.key,
      name: condition.label,
      img: condition.icon,
      flags: { 'd100-system': { condition: condition.key, stacks: 1 } }
    })),
    ...keptCoreStatusEffects
  ];

  game.settings.register('d100-system', 'fate', {
    name: 'Fate',
    hint: 'The shared Fate metacurrency value.',
    scope: 'world',
    config: false,
    type: Number,
    default: 0
  });
  game.settings.register('d100-system', 'fatePosition', {
    name: 'Fate Tracker Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {}
  });

  game.settings.register('d100-system', 'trackers', {
    name: 'Shared Trackers',
    hint: 'GM-managed counters visible to some or all players, optionally linked to specific scenes.',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });
  game.settings.register('d100-system', 'trackersPanelPosition', {
    name: 'Trackers Panel Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {}
  });

  const renderFateTracker = () => {
    const existingTracker = document.querySelector('#d100-fate-tracker');
    const fateValue = Math.max(0, Number(game.settings.get('d100-system', 'fate')) || 0);
    const canAdjustFate = !!game.user?.isGM;
    const savedPosition = game.settings.get('d100-system', 'fatePosition') ?? {};

    if (!existingTracker) {
      document.body.insertAdjacentHTML('beforeend', `
        <section id="d100-fate-tracker" class="d100-fate-tracker" aria-label="Fate tracker">
          <strong class="d100-fate-drag-handle" title="Drag to move Fate tracker">Fate</strong>
          <button type="button" data-fate-adjust="-1" aria-label="Decrease Fate">-</button>
          <input type="number" min="0" value="${fateValue}" aria-label="Fate value" ${canAdjustFate ? '' : 'disabled'} />
          <button type="button" data-fate-adjust="1" aria-label="Increase Fate">+</button>
        </section>
      `);
    } else {
      existingTracker.querySelector('input').value = fateValue;
      existingTracker.querySelectorAll('button, input').forEach((element) => {
        element.disabled = !canAdjustFate;
      });
    }

    const tracker = document.querySelector('#d100-fate-tracker');
    if (!tracker) return;
    if (Number.isFinite(Number(savedPosition.left)) && Number.isFinite(Number(savedPosition.top))) {
      tracker.style.left = `${Number(savedPosition.left)}px`;
      tracker.style.top = `${Number(savedPosition.top)}px`;
      tracker.style.right = 'auto';
    }
    if (tracker.dataset.d100Bound) return;
    tracker.dataset.d100Bound = 'true';

    const updateFate = async (value) => {
      const previousValue = Math.max(0, Number(game.settings.get('d100-system', 'fate')) || 0);
      const nextValue = Math.max(0, Number(value) || 0);
      if (nextValue === previousValue) {
        renderFateTracker();
        return;
      }

      await game.settings.set('d100-system', 'fate', nextValue);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `<p><strong>Fate</strong> changed from ${previousValue} to ${nextValue}.</p>`
      });
      renderFateTracker();
    };

    tracker.querySelectorAll('[data-fate-adjust]').forEach((button) => {
      button.addEventListener('click', async () => {
        const currentValue = Number(tracker.querySelector('input').value) || 0;
        await updateFate(currentValue + Number(button.dataset.fateAdjust));
      });
    });
    tracker.querySelector('input').addEventListener('change', async (event) => {
      await updateFate(event.currentTarget.value);
    });

    const dragHandle = tracker.querySelector('.d100-fate-drag-handle');
    dragHandle.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const initialRect = tracker.getBoundingClientRect();
      const offsetX = event.clientX - initialRect.left;
      const offsetY = event.clientY - initialRect.top;

      const moveTracker = (moveEvent) => {
        const maxLeft = Math.max(0, window.innerWidth - initialRect.width);
        const maxTop = Math.max(0, window.innerHeight - initialRect.height);
        const left = Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX));
        const top = Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY));
        tracker.style.left = `${left}px`;
        tracker.style.top = `${top}px`;
        tracker.style.right = 'auto';
      };
      const savePosition = async () => {
        document.removeEventListener('pointermove', moveTracker);
        const rect = tracker.getBoundingClientRect();
        await game.settings.set('d100-system', 'fatePosition', { left: Math.round(rect.left), top: Math.round(rect.top) });
      };

      document.addEventListener('pointermove', moveTracker);
      document.addEventListener('pointerup', savePosition, { once: true });
    });
  };

  game.d100System.renderFateTracker = renderFateTracker;

  // ---------------------------------------------------------------------
  // Shared Trackers: GM-managed counters, visible to all or specific
  // players, optionally scoped to specific scenes.
  // ---------------------------------------------------------------------
  const getTrackers = () => {
    const raw = game.settings.get('d100-system', 'trackers');
    return Array.isArray(raw) ? raw : [];
  };

  const setTrackers = async (trackers) => game.settings.set('d100-system', 'trackers', trackers);

  const isTrackerVisibleOnCurrentScene = (tracker) => {
    if (tracker.sceneScope !== 'linked') return true;
    const sceneId = canvas?.scene?.id ?? null;
    return !!sceneId && Array.isArray(tracker.sceneIds) && tracker.sceneIds.includes(sceneId);
  };

  const canUserAdjustTracker = (tracker) => {
    if (game.user?.isGM) return true;
    return Array.isArray(tracker.allowedUserIds) && tracker.allowedUserIds.includes(game.user?.id);
  };

  const bindSceneAutocomplete = (root, sceneOptions) => {
    const chipContainer = root.querySelector('.tracker-edit-scene-chips');
    const searchInput = root.querySelector('.tracker-edit-scene-search');
    const suggestionsBox = root.querySelector('.tracker-edit-scene-suggestions');
    const addButton = root.querySelector('.tracker-edit-scene-add-button');
    if (!chipContainer || !searchInput || !suggestionsBox) return;

    const addChip = (scene) => {
      if (chipContainer.querySelector(`[data-scene-id="${scene.id}"]`)) return;
      chipContainer.insertAdjacentHTML('beforeend', `<span class="tracker-scene-chip" data-scene-id="${scene.id}">${scene.name}<button type="button" class="tracker-scene-chip-remove" data-scene-id="${scene.id}" aria-label="Remove ${scene.name}"><i class="fas fa-times"></i></button></span>`);
      chipContainer.querySelector(`[data-scene-id="${scene.id}"] .tracker-scene-chip-remove`)?.addEventListener('click', (event) => {
        event.currentTarget.closest('.tracker-scene-chip')?.remove();
      });
    };

    chipContainer.querySelectorAll('.tracker-scene-chip-remove').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.currentTarget.closest('.tracker-scene-chip')?.remove();
      });
    });

    const hideSuggestions = () => {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.remove('open');
    };
    const selectScene = (scene) => {
      addChip(scene);
      searchInput.value = '';
      hideSuggestions();
      searchInput.focus();
    };
    const showSuggestions = () => {
      const typed = searchInput.value.trim().toLowerCase();
      const alreadyLinked = new Set([...chipContainer.querySelectorAll('.tracker-scene-chip')].map((chip) => chip.dataset.sceneId));
      const matches = sceneOptions
        .filter((scene) => !alreadyLinked.has(scene.id))
        .filter((scene) => !typed || scene.name.toLowerCase().includes(typed))
        .slice(0, 8);
      if (!matches.length) {
        hideSuggestions();
        return;
      }
      suggestionsBox.innerHTML = matches
        .map((scene) => `<div class="tracker-scene-suggestion" data-scene-id="${scene.id}">${scene.name}</div>`)
        .join('');
      suggestionsBox.classList.add('open');
      suggestionsBox.querySelectorAll('.tracker-scene-suggestion').forEach((suggestionElement) => {
        suggestionElement.addEventListener('mousedown', (event) => {
          event.preventDefault();
          const scene = sceneOptions.find((entry) => entry.id === suggestionElement.dataset.sceneId);
          if (scene) selectScene(scene);
        });
      });
    };
    const attemptAdd = () => {
      const firstMatch = suggestionsBox.querySelector('.tracker-scene-suggestion');
      if (firstMatch) {
        const scene = sceneOptions.find((entry) => entry.id === firstMatch.dataset.sceneId);
        if (scene) {
          selectScene(scene);
          return;
        }
      }
      const typedName = searchInput.value.trim();
      if (!typedName) return;
      const exactMatch = sceneOptions.find((entry) => entry.name.toLowerCase() === typedName.toLowerCase());
      if (exactMatch) {
        selectScene(exactMatch);
      } else {
        ui.notifications.warn(`No Scene named "${typedName}" found.`);
      }
    };

    searchInput.addEventListener('focus', showSuggestions);
    searchInput.addEventListener('input', showSuggestions);
    searchInput.addEventListener('blur', () => setTimeout(hideSuggestions, 100));
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        attemptAdd();
      } else if (event.key === 'Escape') {
        hideSuggestions();
      }
    });
    addButton?.addEventListener('click', attemptAdd);
  };

  const openTrackerSceneDialog = (trackerId) => {
    if (!game.user?.isGM) return;
    const tracker = getTrackers().find((entry) => entry.id === trackerId);
    if (!tracker) return;
    const sceneOptions = [...game.scenes ?? []];
    const chipsHtml = (Array.isArray(tracker.sceneIds) ? tracker.sceneIds : [])
      .map((sceneId) => sceneOptions.find((scene) => scene.id === sceneId))
      .filter(Boolean)
      .map((scene) => `<span class="tracker-scene-chip" data-scene-id="${scene.id}">${scene.name}<button type="button" class="tracker-scene-chip-remove" data-scene-id="${scene.id}" aria-label="Remove ${scene.name}"><i class="fas fa-times"></i></button></span>`)
      .join('');

    new Dialog({
      title: `Scene Linking: ${tracker.label || 'Tracker'}`,
      content: `
        <div class="d100-system">
          <div class="form-group">
            <label>Scene Scope</label>
            <select class="tracker-edit-scope">
              <option value="global" ${tracker.sceneScope !== 'linked' ? 'selected' : ''}>Visible on all Scenes</option>
              <option value="linked" ${tracker.sceneScope === 'linked' ? 'selected' : ''}>Linked to specific Scenes</option>
            </select>
          </div>
          <div class="form-group tracker-edit-scenes">
            <label>Linked Scenes</label>
            <div class="tracker-edit-scene-chips">${chipsHtml}</div>
            <div class="tracker-edit-scene-add">
              <div class="tracker-edit-scene-input-wrap">
                <input type="text" class="tracker-edit-scene-search" placeholder="Type a scene name…" autocomplete="off" />
                <div class="tracker-edit-scene-suggestions"></div>
              </div>
              <button type="button" class="tracker-edit-scene-add-button">Add</button>
            </div>
          </div>
        </div>
      `,
      buttons: {
        save: {
          label: 'Save',
          callback: async (dialogHtml) => {
            const root = dialogHtml?.[0] ?? dialogHtml;
            const currentTrackers = getTrackers();
            const target = currentTrackers.find((entry) => entry.id === trackerId);
            if (!target) return;
            target.sceneScope = root.querySelector('.tracker-edit-scope').value;
            target.sceneIds = [...root.querySelectorAll('.tracker-scene-chip')].map((chip) => chip.dataset.sceneId);
            await setTrackers(currentTrackers);
            renderTrackersPanel();
          }
        },
        cancel: { label: 'Cancel' }
      },
      default: 'save',
      render: (dialogHtml) => {
        const root = dialogHtml?.[0] ?? dialogHtml;
        bindSceneAutocomplete(root, sceneOptions);
      }
    }, { width: 420, classes: ['dialog', 'd100-system'] }).render(true);
  };

  const openTrackerPlayerDialog = (trackerId) => {
    if (!game.user?.isGM) return;
    const tracker = getTrackers().find((entry) => entry.id === trackerId);
    if (!tracker) return;
    const userOptions = [...game.users ?? []].filter((user) => !user.isGM);

    new Dialog({
      title: `Player Permissions: ${tracker.label || 'Tracker'}`,
      content: `
        <div class="d100-system">
          <div class="form-group tracker-edit-players">
            <label>Players who can adjust (GM can always)</label>
            <div class="tracker-edit-player-list">
              ${userOptions.map((user) => `
                <label><input type="checkbox" class="tracker-edit-player" value="${user.id}" ${Array.isArray(tracker.allowedUserIds) && tracker.allowedUserIds.includes(user.id) ? 'checked' : ''} /> ${user.name}</label>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      buttons: {
        save: {
          label: 'Save',
          callback: async (dialogHtml) => {
            const root = dialogHtml?.[0] ?? dialogHtml;
            const currentTrackers = getTrackers();
            const target = currentTrackers.find((entry) => entry.id === trackerId);
            if (!target) return;
            target.allowedUserIds = [...root.querySelectorAll('.tracker-edit-player:checked')].map((element) => element.value);
            await setTrackers(currentTrackers);
            renderTrackersPanel();
          }
        },
        cancel: { label: 'Cancel' }
      },
      default: 'save'
    }, { width: 320, classes: ['dialog', 'd100-system'] }).render(true);
  };

  const openTrackerBoundsDialog = (trackerId) => {
    if (!game.user?.isGM) return;
    const tracker = getTrackers().find((entry) => entry.id === trackerId);
    if (!tracker) return;

    new Dialog({
      title: `Min / Max: ${tracker.label || 'Tracker'}`,
      content: `
        <div class="d100-system">
          <div class="form-group tracker-edit-bounds-dialog">
            <label>Min</label>
            <input type="number" class="tracker-edit-min" value="${tracker.min ?? ''}" placeholder="No minimum" />
          </div>
          <div class="form-group tracker-edit-bounds-dialog">
            <label>Max</label>
            <input type="number" class="tracker-edit-max" value="${tracker.max ?? ''}" placeholder="No maximum" />
          </div>
        </div>
      `,
      buttons: {
        save: {
          label: 'Save',
          callback: async (dialogHtml) => {
            const root = dialogHtml?.[0] ?? dialogHtml;
            const currentTrackers = getTrackers();
            const target = currentTrackers.find((entry) => entry.id === trackerId);
            if (!target) return;
            const minValue = root.querySelector('.tracker-edit-min').value;
            const maxValue = root.querySelector('.tracker-edit-max').value;
            target.min = minValue === '' ? null : Number(minValue);
            target.max = maxValue === '' ? null : Number(maxValue);
            if (target.min !== null && target.max !== null && target.min > target.max) {
              ui.notifications.warn('Min was greater than Max — swapped them.');
              [target.min, target.max] = [target.max, target.min];
            }
            await setTrackers(currentTrackers);
            renderTrackersPanel();
          }
        },
        cancel: { label: 'Cancel' }
      },
      default: 'save'
    }, { width: 280, classes: ['dialog', 'd100-system'] }).render(true);
  };

  const renderTrackersPanel = () => {
    const trackers = getTrackers();
    const visibleTrackers = trackers.filter((tracker) => isTrackerVisibleOnCurrentScene(tracker));
    const existingPanel = document.querySelector('#d100-trackers-panel');
    const isGM = !!game.user?.isGM;

    if (!visibleTrackers.length && !isGM) {
      existingPanel?.remove();
      return;
    }

    const savedPosition = game.settings.get('d100-system', 'trackersPanelPosition') ?? {};
    const rowsHtml = visibleTrackers.length
      ? visibleTrackers.map((tracker) => {
        const canAdjust = canUserAdjustTracker(tracker);
        const min = Number.isFinite(Number(tracker.min)) ? Number(tracker.min) : null;
        const max = Number.isFinite(Number(tracker.max)) ? Number(tracker.max) : null;
        const label = tracker.label || 'Tracker';
        const value = Number(tracker.value) || 0;
        const boundedRange = min !== null && max !== null && max > min;
        const percent = boundedRange ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : null;
        const barHtml = percent !== null
          ? `<div class="d100-tracker-bar" aria-label="${label} progress"><span style="width: ${percent}%"></span></div>`
          : '';
        return `
          <div class="d100-tracker-entry" data-tracker-id="${tracker.id}">
            <div class="d100-tracker-row" data-tracker-id="${tracker.id}">
              ${isGM
                ? `<input type="text" class="d100-tracker-label-input" value="${label.replace(/"/g, '&quot;')}" aria-label="Tracker label" />`
                : `<span class="d100-tracker-label">${label}</span>`}
              ${isGM ? `<button type="button" class="d100-tracker-scene-btn" title="Scene Linking" aria-label="Scene linking for ${label}"><i class="fas fa-map"></i></button>` : ''}
              ${isGM ? `<button type="button" class="d100-tracker-player-btn" title="Player Permissions" aria-label="Player permissions for ${label}"><i class="fas fa-user"></i></button>` : ''}
              ${isGM ? `<button type="button" class="d100-tracker-bounds-btn" title="Min / Max" aria-label="Min and max for ${label}"><i class="fas fa-ruler-horizontal"></i></button>` : ''}
              <button type="button" data-tracker-adjust="-1" ${canAdjust ? '' : 'disabled'} aria-label="Decrease ${label}">-</button>
              <input type="number" class="d100-tracker-value-input" value="${value}" ${min !== null ? `min="${min}"` : ''} ${max !== null ? `max="${max}"` : ''} ${canAdjust ? '' : 'disabled'} aria-label="${label} value" />
              <button type="button" data-tracker-adjust="1" ${canAdjust ? '' : 'disabled'} aria-label="Increase ${label}">+</button>
              ${isGM ? `<button type="button" class="d100-tracker-remove" aria-label="Remove ${label}"><i class="fas fa-times"></i></button>` : ''}
            </div>
            ${barHtml}
          </div>
        `;
      }).join('')
      : `<p class="d100-trackers-empty">No Trackers yet.${isGM ? ' Click Add to create one.' : ''}</p>`;

    const panelHtml = `
      <section id="d100-trackers-panel" class="d100-trackers-panel" aria-label="Trackers">
        <div class="d100-trackers-header">
          <strong class="d100-trackers-drag-handle" title="Drag to move Trackers panel">Trackers</strong>
        </div>
        <div class="d100-trackers-rows">${rowsHtml}</div>
        ${isGM ? '<button type="button" class="d100-trackers-add">Add</button>' : ''}
      </section>
    `;

    existingPanel?.remove();
    document.body.insertAdjacentHTML('beforeend', panelHtml);
    const panel = document.querySelector('#d100-trackers-panel');
    if (!panel) return;

    if (Number.isFinite(Number(savedPosition.left)) && Number.isFinite(Number(savedPosition.top))) {
      panel.style.left = `${Number(savedPosition.left)}px`;
      panel.style.top = `${Number(savedPosition.top)}px`;
      panel.style.right = 'auto';
    }

    const updateTrackerValue = async (trackerId, value) => {
      const currentTrackers = getTrackers();
      const tracker = currentTrackers.find((entry) => entry.id === trackerId);
      if (!tracker) return;
      const previousValue = Number(tracker.value) || 0;
      let nextValue = Number(value);
      if (!Number.isFinite(nextValue)) nextValue = previousValue;
      if (Number.isFinite(Number(tracker.min))) nextValue = Math.max(Number(tracker.min), nextValue);
      if (Number.isFinite(Number(tracker.max))) nextValue = Math.min(Number(tracker.max), nextValue);
      if (nextValue === previousValue) {
        renderTrackersPanel();
        return;
      }
      tracker.value = nextValue;
      await setTrackers(currentTrackers);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `<p><strong>${tracker.label || 'Tracker'}</strong> changed from ${previousValue} to ${nextValue}.</p>`
      });
    };

    const renameTracker = async (trackerId, newLabel) => {
      const currentTrackers = getTrackers();
      const tracker = currentTrackers.find((entry) => entry.id === trackerId);
      if (!tracker) return;
      const trimmed = newLabel.trim() || 'Tracker';
      if (trimmed === tracker.label) return;
      tracker.label = trimmed;
      await setTrackers(currentTrackers);
      renderTrackersPanel();
    };

    const removeTracker = async (trackerId) => {
      const tracker = getTrackers().find((entry) => entry.id === trackerId);
      if (!tracker) return;
      if (!window.confirm(`Remove the "${tracker.label || 'Tracker'}" tracker? This cannot be undone.`)) return;
      const currentTrackers = getTrackers().filter((entry) => entry.id !== trackerId);
      await setTrackers(currentTrackers);
      renderTrackersPanel();
    };

    panel.querySelectorAll('.d100-tracker-row').forEach((row) => {
      const trackerId = row.dataset.trackerId;
      row.querySelectorAll('[data-tracker-adjust]').forEach((button) => {
        button.addEventListener('click', async () => {
          const currentValue = Number(row.querySelector('.d100-tracker-value-input').value) || 0;
          await updateTrackerValue(trackerId, currentValue + Number(button.dataset.trackerAdjust));
        });
      });
      row.querySelector('.d100-tracker-value-input').addEventListener('change', async (event) => {
        await updateTrackerValue(trackerId, event.currentTarget.value);
      });
      row.querySelector('.d100-tracker-label-input')?.addEventListener('change', async (event) => {
        await renameTracker(trackerId, event.currentTarget.value);
      });
      row.querySelector('.d100-tracker-scene-btn')?.addEventListener('click', () => openTrackerSceneDialog(trackerId));
      row.querySelector('.d100-tracker-player-btn')?.addEventListener('click', () => openTrackerPlayerDialog(trackerId));
      row.querySelector('.d100-tracker-bounds-btn')?.addEventListener('click', () => openTrackerBoundsDialog(trackerId));
      row.querySelector('.d100-tracker-remove')?.addEventListener('click', async () => {
        await removeTracker(trackerId);
      });
    });

    panel.querySelector('.d100-trackers-add')?.addEventListener('click', async () => {
      const currentTrackers = getTrackers();
      currentTrackers.push({
        id: foundry.utils.randomID(),
        label: 'New Tracker',
        value: 0,
        min: null,
        max: null,
        sceneScope: 'global',
        sceneIds: [],
        allowedUserIds: []
      });
      await setTrackers(currentTrackers);
      renderTrackersPanel();
    });

    const dragHandle = panel.querySelector('.d100-trackers-drag-handle');
    dragHandle.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const initialRect = panel.getBoundingClientRect();
      const offsetX = event.clientX - initialRect.left;
      const offsetY = event.clientY - initialRect.top;

      const movePanel = (moveEvent) => {
        const maxLeft = Math.max(0, window.innerWidth - initialRect.width);
        const maxTop = Math.max(0, window.innerHeight - initialRect.height);
        const left = Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX));
        const top = Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY));
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.right = 'auto';
      };
      const savePosition = async () => {
        document.removeEventListener('pointermove', movePanel);
        const rect = panel.getBoundingClientRect();
        await game.settings.set('d100-system', 'trackersPanelPosition', { left: Math.round(rect.left), top: Math.round(rect.top) });
      };

      document.addEventListener('pointermove', movePanel);
      document.addEventListener('pointerup', savePosition, { once: true });
    });
  };


  game.d100System.renderTrackersPanel = renderTrackersPanel;

  game.d100System.rollSkillMacro = async (actorId, skillKey) => {
    const actor = game.actors.get(actorId);
    if (!actor) {
      ui.notifications.warn('Actor not found for this skill macro.');
      return;
    }
    await actor.sheet?._onSkillRoll({ preventDefault: () => {}, currentTarget: { dataset: { skill: skillKey } } });
  };

  CONFIG.Item.typeLabels = {
    ...CONFIG.Item.typeLabels,
    gear: 'Gear',
    weapon: 'Weapon',
    armor: 'Armor',
    talent: 'Talent',
    profession: 'Profession',
    race: 'Race',
    spell: 'Spell',
    trait: 'Traits',
    npcAction: 'NPC Actions'
  };

  const attributeLabels = {
    strength: 'Strength',
    toughness: 'Toughness',
    observation: 'Observation',
    reflex: 'Reflex',
    majesty: 'Majesty'
  };

  const languageOptions = [
    { key: 'common', label: 'Common' },
    { key: 'avian', label: 'Avian' },
    { key: 'draconic', label: 'Draconic' },
    { key: 'dwarvish', label: 'Dwarvish' },
    { key: 'elvish', label: 'Elvish' },
    { key: 'felidari', label: 'Felidari' },
    { key: 'giant', label: 'Giant' },
    { key: 'gnome', label: 'Gnome' },
    { key: 'orc', label: 'Orc' },
    { key: 'tortun', label: 'Tortun' },
    { key: 'celestial', label: 'Celestial' },
    { key: 'druidic', label: 'Druidic' },
    { key: 'nyxian', label: 'Nyxian' },
    { key: 'voidsong', label: 'Voidsong' },
    { key: 'glacior', label: 'Glacior' },
    { key: 'muhdra', label: 'Muhdra' },
    { key: 'vulkaric', label: 'Vulkaric' },
    { key: 'stratu', label: 'Stratu' },
    { key: 'primordial', label: 'Primordial' },
    { key: 'faelori', label: 'Faelori' }
  ];

  const skillLabels = {
    acrobatics: 'Acrobatics',
    alchemy: 'Alchemy',
    athletics: 'Athletics',
    crafting: 'Crafting',
    investigation: 'Investigation',
    knowledge: 'Knowledge',
    languages: 'Languages',
    luck: 'Luck',
    magecraft: 'Magecraft',
    medicine: 'Medicine',
    performance: 'Performance',
    sleight_of_hand: 'Sleight of Hand',
    speechcraft: 'Speechcraft',
    stealth: 'Stealth',
    survival: 'Survival',
    vehicles: 'Vehicles',
    heavy_weapons: 'Heavy Weapons',
    light_weapons: 'Light Weapons',
    magic_weapons: 'Magic Weapons',
    ranged_weapons: 'Ranged Weapons',
    special_weapons: 'Special Weapons',
    armor: 'Armor',
    evasion: 'Evasion',
    shields: 'Shields',
    cosmic_magic: 'Cosmic Magic',
    druidic_magic: 'Druidic Magic',
    elemental_magic: 'Elemental Magic',
    light_magic: 'Light Magic',
    shadow_magic: 'Shadow Magic'
  };

  const summaryAttributeOrder = ['strength', 'toughness', 'observation', 'reflex', 'majesty'];
  const resourceOptions = ['adrenaline', 'devotion', 'focus', 'mana'];
  // Level-indexed progression table (index 0 = level 1). Attribute Max is the per-attribute cap,
  // Attribute Budget is the total points allowed across all 5 attributes at that level.
  const levelProgressionTable = [
    { attributeMax: 4, attributeBudget: 9, traitPoints: 3 },
    { attributeMax: 4, attributeBudget: 10, traitPoints: 3 },
    { attributeMax: 5, attributeBudget: 12, traitPoints: 4 },
    { attributeMax: 5, attributeBudget: 13, traitPoints: 4 },
    { attributeMax: 5, attributeBudget: 14, traitPoints: 5 },
    { attributeMax: 5, attributeBudget: 16, traitPoints: 5 },
    { attributeMax: 6, attributeBudget: 17, traitPoints: 6 },
    { attributeMax: 6, attributeBudget: 18, traitPoints: 6 },
    { attributeMax: 6, attributeBudget: 20, traitPoints: 7 },
    { attributeMax: 6, attributeBudget: 21, traitPoints: 7 },
    { attributeMax: 7, attributeBudget: 22, traitPoints: 8 },
    { attributeMax: 7, attributeBudget: 24, traitPoints: 8 },
    { attributeMax: 7, attributeBudget: 25, traitPoints: 9 },
    { attributeMax: 8, attributeBudget: 26, traitPoints: 9 },
    { attributeMax: 8, attributeBudget: 28, traitPoints: 10 },
    { attributeMax: 8, attributeBudget: 29, traitPoints: 10 },
    { attributeMax: 9, attributeBudget: 30, traitPoints: 11 },
    { attributeMax: 9, attributeBudget: 32, traitPoints: 11 },
    { attributeMax: 9, attributeBudget: 33, traitPoints: 12 },
    { attributeMax: 9, attributeBudget: 34, traitPoints: 12 }
  ];
  const getLevelProgression = (level) => {
    const clampedLevel = Math.min(levelProgressionTable.length, Math.max(1, Math.floor(Number(level) || 1)));
    return levelProgressionTable[clampedLevel - 1];
  };
  const npcRoleOptions = [
    { value: 'minion', label: 'Minion' },
    { value: 'ambusher', label: 'Ambusher' },
    { value: 'brute', label: 'Brute' },
    { value: 'caster', label: 'Caster' },
    { value: 'controller', label: 'Controller' },
    { value: 'commander', label: 'Commander' },
    { value: 'soldier', label: 'Soldier' }
  ];
  const categoryTraitBucketDefs = [
    { key: 'general', field: 'generalTraits', label: 'General Traits', level: 0 },
    { key: 'level5', field: 'level5Traits', label: 'Level 5 Traits', level: 5 },
    { key: 'level9', field: 'level9Traits', label: 'Level 9 Traits', level: 9 },
    { key: 'level13', field: 'level13Traits', label: 'Level 13 Traits', level: 13 },
    { key: 'level17', field: 'level17Traits', label: 'Level 17 Traits', level: 17 }
  ];
  const actionTypeOptions = [
    { value: 'major', label: 'Major Action' },
    { value: 'quick', label: 'Quick Action' },
    { value: 'free', label: 'Free Action' },
    { value: 'reaction', label: 'Reaction' }
  ];
  const getActionTypeLabel = (value) => actionTypeOptions.find((option) => option.value === value)?.label ?? 'Major Action';
  const parseDiceExpression = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '1d6';
    if (/^\d+d\d+$/i.test(raw)) return raw.toLowerCase();
    const numericValue = Number(raw) || 1;
    return `${Math.max(1, numericValue)}d6`;
  };
  const buildEmpoweredDiceExpression = (baseValue, empowermentDiceValue, empowermentUses, skillValue = 0) => {
    const baseExpression = String(baseValue ?? '').trim();
    if (!baseExpression) return null;
    const empoweredCount = Math.max(0, Number(empowermentUses) || 0);
    const extraExpression = String(empowermentDiceValue ?? '').trim();
    const skillBonus = Number(skillValue) || 0;

    let expression = baseExpression;
    if (empoweredCount > 0 && extraExpression) {
      const diceMatch = /^(\d+)d(\d+)$/i.exec(extraExpression);
      const empowermentExpression = diceMatch
        ? `${Number(diceMatch[1]) * empoweredCount}d${diceMatch[2]}`
        : Array.from({ length: empoweredCount }, () => extraExpression).join(' + ');
      expression += ` + ${empowermentExpression}`;
    }
    if (skillBonus > 0) {
      expression += ` + ${skillBonus}`;
    }
    return expression;
  };
  const areaTemplateButton = (color = '#6366f1', size = 1, shape = '', configured = false, rayLength = 1, rayWidth = 1) => `<button type="button" class="d100-place-area-template" data-d100-area-template data-area-color="${color}" data-area-size="${size}" data-area-shape="${shape}" data-area-configured="${configured}" data-area-ray-length="${rayLength}" data-area-ray-width="${rayWidth}"><i class="fas fa-draw-polygon"></i> Place Area</button>`;
  const configuredAreaButton = (source) => source?.areaOfEffect
    ? `<p>${areaTemplateButton(source.areaColor, source.areaSize, source.areaShape, true, source.areaRayLength, source.areaRayWidth)}</p>`
    : '';
  const getRadiusShapes = (tokenDocument, radiusSquares, gridSize, position = {}) => {
    const radius = Math.max(1, Number(radiusSquares) || 1) * gridSize;
    const tokenX = Number(position.x ?? tokenDocument.x) || 0;
    const tokenY = Number(position.y ?? tokenDocument.y) || 0;
    const tokenWidth = (Number(position.width ?? tokenDocument.width) || 1) * gridSize;
    const tokenHeight = (Number(position.height ?? tokenDocument.height) || 1) * gridSize;
    const left = tokenX - radius;
    const top = tokenY - radius;

    return [
      { type: 'rectangle', x: left, y: top, width: tokenWidth + (radius * 2), height: radius, rotation: 0, anchorX: 0, anchorY: 0 },
      { type: 'rectangle', x: left, y: tokenY + tokenHeight, width: tokenWidth + (radius * 2), height: radius, rotation: 0, anchorX: 0, anchorY: 0 },
      { type: 'rectangle', x: left, y: tokenY, width: radius, height: tokenHeight, rotation: 0, anchorX: 0, anchorY: 0 },
      { type: 'rectangle', x: tokenX + tokenWidth, y: tokenY, width: radius, height: tokenHeight, rotation: 0, anchorX: 0, anchorY: 0 }
    ];
  };

  async function placeAreaTemplate(defaults = {}) {
    if (!canvas?.scene) {
      ui.notifications.warn('Open an active scene before placing an area template.');
      return;
    }

    const defaultColor = /^#[0-9a-f]{6}$/i.test(String(defaults.color ?? '')) ? defaults.color : '#6366f1';
    const defaultSize = Math.max(1, Number(defaults.size) || 1);
    const defaultRayLength = Math.max(1, Number(defaults.rayLength) || defaultSize);
    const defaultRayWidth = Math.max(1, Number(defaults.rayWidth) || 1);
    const configuredShape = ['cone', 'rect', 'ray', 'radius'].includes(defaults.shape) ? defaults.shape : null;

    const options = configuredShape
      ? { shape: configuredShape, color: defaultColor, distance: defaultSize, length: defaultRayLength, width: defaultRayWidth }
      : await new Promise((resolve) => {
      new Dialog({
        title: 'Place Area Template',
        content: `<div class="d100-system"><form><div class="form-group"><label>Shape</label><select name="shape"><option value="cone">Cone</option><option value="rect">Circle / Cube</option><option value="ray">Ray</option><option value="radius">Radius</option></select></div><div class="form-group"><label>Color</label><input type="color" name="color" value="${defaultColor}" /></div><div class="form-group" data-area-size><label>Size in Squares</label><input type="number" name="distance" value="${defaultSize}" min="1" step="1" /></div><div class="form-group" data-ray-length hidden><label>Length in Squares</label><input type="number" name="length" value="${defaultSize}" min="1" step="1" /></div><div class="form-group" data-ray-width hidden><label>Width in Squares</label><input type="number" name="width" value="1" min="1" step="1" /></div></form></div>`,
        buttons: { place: { label: 'Place Template', callback: (html) => resolve(new foundry.applications.ux.FormDataExtended(html[0].querySelector('form')).object) } },
        default: 'place',
        close: () => resolve(null),
        render: (html) => {
          const form = html[0].querySelector('form');
          const shapeSelect = form.elements.shape;
          const toggleRayInputs = () => {
            const isRay = shapeSelect.value === 'ray';
            form.querySelector('[data-area-size]').hidden = isRay;
            form.querySelector('[data-ray-length]').hidden = !isRay;
            form.querySelector('[data-ray-width]').hidden = !isRay;
          };
          shapeSelect.addEventListener('change', toggleRayInputs);
          toggleRayInputs();
        }
      }, { classes: ['dialog', 'd100-system'] }).render(true);
    });
    if (!options) return;

    const distance = Math.max(1, Number(options.shape === 'ray' ? options.length : options.distance) || 1) * canvas.grid.size;
    const rayWidth = Math.max(1, Number(options.width) || 1) * canvas.grid.size;
    const shapeType = options.shape === 'rect' ? 'rectangle' : options.shape === 'ray' ? 'line' : options.shape;
    const areaColor = Number.parseInt(String(options.color ?? '#6366f1').replace('#', ''), 16);

    if (options.shape === 'radius') {
      const token = canvas.tokens.controlled[0];
      if (!token) {
        ui.notifications.warn('Select a token before placing a Radius area.');
        return;
      }

      const radiusSquares = Math.max(1, Number(options.distance) || 1);
      await CONFIG.Region.documentClass.create({
        name: `${token.name} Radius`,
        color: options.color,
        visibility: CONST.REGION_VISIBILITY.ALWAYS,
        flags: {
          'd100-system': {
            radiusTokenId: token.id,
            radiusSquares
          }
        },
        shapes: getRadiusShapes(token.document, radiusSquares, canvas.grid.size)
      }, { parent: canvas.scene });
      return;
    }

    const preview = new PIXI.Graphics();
    canvas.interface.addChild(preview);
    let currentPoint = canvas.mousePosition ?? { x: canvas.dimensions.width / 2, y: canvas.dimensions.height / 2 };
    let rotation = 0;
    const canvasView = canvas.app.view;

    const snapToGrid = (point) => canvas.grid.getSnappedPoint?.(point, {
      mode: CONST.GRID_SNAPPING_MODES.VERTEX,
      resolution: 1
    }) ?? {
      x: Math.round(point.x / canvas.grid.size) * canvas.grid.size,
      y: Math.round(point.y / canvas.grid.size) * canvas.grid.size
    };
    const getScenePoint = (event) => snapToGrid(canvas.canvasCoordinatesFromClient({ x: event.clientX, y: event.clientY }));
    const rotatePoint = (point, origin) => {
      const radians = rotation * (Math.PI / 180);
      const offsetX = point.x - origin.x;
      const offsetY = point.y - origin.y;
      return {
        x: origin.x + (offsetX * Math.cos(radians)) - (offsetY * Math.sin(radians)),
        y: origin.y + (offsetX * Math.sin(radians)) + (offsetY * Math.cos(radians))
      };
    };
    const getRayCenterlinePoint = (point) => {
      const radians = rotation * (Math.PI / 180);
      return {
        x: point.x - (Math.sin(radians) * rayWidth / 2),
        y: point.y + (Math.cos(radians) * rayWidth / 2)
      };
    };
    const getConeOriginPoint = (point) => {
      const snappedRotation = (Math.round(rotation / 90) * 90) % 360;
      const radians = snappedRotation * (Math.PI / 180);
      const halfGrid = canvas.grid.size / 2;
      return {
        x: point.x + (Math.abs(Math.sin(radians)) * halfGrid),
        y: point.y + (Math.abs(Math.cos(radians)) * halfGrid)
      };
    };
    const drawPolygon = (points) => {
      preview.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => preview.lineTo(point.x, point.y));
      preview.closePath();
    };
    const drawPreview = (point) => {
      preview.clear();
      preview.lineStyle({ width: 3, color: areaColor, alpha: 0.95 });
      preview.beginFill(areaColor, 0.2);
      if (shapeType === 'cone') {
        const coneOrigin = getConeOriginPoint(point);
        const halfAngle = (53 / 2) * (Math.PI / 180);
        const coneWidth = Math.sin(halfAngle) * distance;
        drawPolygon([
          coneOrigin,
          rotatePoint({ x: coneOrigin.x + distance, y: coneOrigin.y - coneWidth }, coneOrigin),
          rotatePoint({ x: coneOrigin.x + distance, y: coneOrigin.y + coneWidth }, coneOrigin)
        ]);
      } else if (shapeType === 'line') {
        const rayPoint = getRayCenterlinePoint(point);
        drawPolygon([
          rotatePoint({ x: rayPoint.x, y: rayPoint.y - (rayWidth / 2) }, rayPoint),
          rotatePoint({ x: rayPoint.x + distance, y: rayPoint.y - (rayWidth / 2) }, rayPoint),
          rotatePoint({ x: rayPoint.x + distance, y: rayPoint.y + (rayWidth / 2) }, rayPoint),
          rotatePoint({ x: rayPoint.x, y: rayPoint.y + (rayWidth / 2) }, rayPoint)
        ]);
      } else {
        drawPolygon([
          rotatePoint({ x: point.x, y: point.y }, point),
          rotatePoint({ x: point.x + distance, y: point.y }, point),
          rotatePoint({ x: point.x + distance, y: point.y + distance }, point),
          rotatePoint({ x: point.x, y: point.y + distance }, point)
        ]);
      }
      preview.endFill();
    };
    const removePreview = () => {
      canvasView.removeEventListener('pointermove', onPointerMove, true);
      canvasView.removeEventListener('pointerdown', onPointerDown, true);
      canvasView.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('keydown', onKeyDown);
      preview.destroy();
    };
    const onPointerMove = (event) => {
      currentPoint = getScenePoint(event);
      drawPreview(currentPoint);
    };
    const onWheel = (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      rotation = (rotation + (event.deltaY > 0 ? 15 : -15) + 360) % 360;
      drawPreview(currentPoint);
    };
    const onPointerDown = async (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const point = getScenePoint(event);
      removePreview();
      const rayPoint = getRayCenterlinePoint(point);
      const coneOrigin = getConeOriginPoint(point);
      const coneHalfWidth = Math.sin((53 / 2) * (Math.PI / 180)) * distance;
      const rotationRadians = rotation * (Math.PI / 180);
      const shape = shapeType === 'cone'
          ? {
              type: 'polygon',
              points: [
                coneOrigin.x,
                coneOrigin.y,
                coneOrigin.x + (distance * Math.cos(rotationRadians)) + (coneHalfWidth * Math.sin(rotationRadians)),
                coneOrigin.y + (distance * Math.sin(rotationRadians)) - (coneHalfWidth * Math.cos(rotationRadians)),
                coneOrigin.x + (distance * Math.cos(rotationRadians)) - (coneHalfWidth * Math.sin(rotationRadians)),
                coneOrigin.y + (distance * Math.sin(rotationRadians)) + (coneHalfWidth * Math.cos(rotationRadians)),
                coneOrigin.x,
                coneOrigin.y
              ]
            }
          : shapeType === 'line'
            ? { type: 'line', x: rayPoint.x, y: rayPoint.y, length: distance, width: rayWidth, rotation }
            : { type: 'rectangle', x: point.x, y: point.y, width: distance, height: distance, rotation, anchorX: 0, anchorY: 0 };
      await CONFIG.Region.documentClass.create({
        name: 'Area of Effect',
        color: options.color,
        visibility: CONST.REGION_VISIBILITY.ALWAYS,
        shapes: [shape]
      }, { parent: canvas.scene });
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') removePreview();
    };

    drawPreview(currentPoint);
    canvasView.addEventListener('pointermove', onPointerMove, true);
    canvasView.addEventListener('pointerdown', onPointerDown, true);
    canvasView.addEventListener('wheel', onWheel, true);
    window.addEventListener('keydown', onKeyDown);
    ui.notifications.info('Move the cursor to place the area. Use Ctrl + mouse wheel to rotate. Left-click to place or Escape to cancel.');
  }
  const isWeaponItem = (item) => {
    if (!item) return false;
    if (item.type === 'weapon') return true;
    return item.type === 'gear' && String(item.system?.category ?? '').trim() === 'weapon';
  };
  const getEquippedArmorDefense = (actor) => [...(actor?.items ?? [])]
    .filter((item) => (item.type === 'gear' && String(item.system?.category ?? '').trim() === 'armor' || item.type === 'armor' && item.system?.armorType === 'armor') && item.system?.equipped !== false)
    .reduce((total, item) => total + (Number(item.system?.defense) || 0), 0);
  const getActiveShieldDefense = (actor) => {
    const shieldId = actor?.flags?.['d100-system']?.activeShieldId;
    const shield = shieldId ? actor.items.get(shieldId) : null;
    const isShield = shield?.type === 'gear' && String(shield.system?.category ?? '').trim() === 'shield'
      || shield?.type === 'armor' && shield.system?.armorType === 'shield';
    if (!shield || !isShield || shield.system?.equipped === false) return 0;
    return Number(shield.system?.defense) || 0;
  };
  const getMaxSpellTier = (skillValue) => {
    const points = Math.max(0, Math.min(9, Number(skillValue) || 0));
    if (points >= 9) return 3;
    if (points >= 6) return 2;
    if (points >= 3) return 1;
    return 0;
  };
  const getEffectTypeLabel = (effect) => {
    if (effect.transfer) return 'Equipped';
    if (effect.statuses?.size || effect.statuses?.length) return 'Condition';
    const duration = effect.duration ?? {};
    if (duration.rounds || duration.turns || duration.seconds || duration.startRound || duration.startTime) return 'Temporary';
    return 'Passive';
  };
  const getItemEffects = (item) => [...(item?.effects ?? [])];
  const getWeaponDamageBonuses = (item) => {
    const bonuses = { ...(item?._source?.system?.damageBonuses ?? item?.system?.damageBonuses ?? {}) };

    getItemEffects(item)
      .filter((effect) => !effect.disabled)
      .flatMap((effect) => effect.changes ?? [])
      .forEach((change) => {
        const match = /^system\.damageBonuses\.([a-z_]+)$/.exec(String(change.key ?? ''));
        if (!match) return;

        const type = match[1];
        const value = Number(change.value) || 0;
        if (change.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE) {
          bonuses[type] = value;
        } else if (change.mode === CONST.ACTIVE_EFFECT_MODES.MULTIPLY) {
          bonuses[type] = (Number(bonuses[type]) || 0) * value;
        } else {
          bonuses[type] = (Number(bonuses[type]) || 0) + value;
        }
      });

    return bonuses;
  };
  const itemEffectsChatContent = (item, actor) => {
    const effects = getItemEffects(item);
    if (!effects.length) return '';
    const effectNames = effects.map((effect) => `<li>${effect.name}</li>`).join('');
    return `<section class="d100-chat-effects"><strong>Active Effects</strong><ul>${effectNames}</ul><button type="button" data-apply-item-effects data-actor-id="${actor.id}" data-item-id="${item.id}">Apply Effects to Selected Tokens</button></section>`;
  };
  // Parses inline syntax inside description/feature text so it can trigger
  // rolls or effects when shown in a chat card:
  //   [[damage:FORMULA]]          e.g. [[damage:2d6]]
  //   [[damage:FORMULA:TYPE]]     e.g. [[damage:2d6:fire]]
  //   [[heal:FORMULA]]            e.g. [[heal:2d6]]
  //   [[condition:KEY]]           e.g. [[condition:poisoned]]
  //   [[condition:KEY:STACKS]]    e.g. [[condition:poisoned:2]]
  //   [[resource:gain:FORMULA]]   e.g. [[resource:gain:1d4]] — affects the acting actor's own Resource pool
  //   [[resource:loss:FORMULA]]   e.g. [[resource:loss:2]]
  const renderChatText = (text, actor = null) => {
    const raw = String(text ?? '').trim();
    if (!raw) return '';
    return raw.replace(/\[\[\s*(damage|heal|condition|resource)\s*:\s*([^\]]+?)\s*\]\]/gi, (match, kindRaw, argsRaw) => {
      const kind = kindRaw.toLowerCase();
      const args = argsRaw.split(':').map((part) => part.trim()).filter((part) => part.length);

      if (kind === 'damage' || kind === 'heal') {
        const formula = args[0];
        if (!formula) return match;
        const type = kind === 'heal' ? 'healing' : (args[1] || 'damage').toLowerCase();
        const typeLabel = type === 'healing' ? 'Healing' : `${type.charAt(0).toUpperCase()}${type.slice(1)} Damage`;
        return `<button type="button" class="inline-effect-roll" data-inline-kind="roll" data-inline-formula="${escapeHtmlAttr(formula)}" data-inline-type="${escapeHtmlAttr(type)}"><i class="fas fa-dice-d20"></i> Roll ${escapeHtmlAttr(formula)} ${typeLabel}</button>`;
      }

      if (kind === 'condition') {
        const conditionKey = String(args[0] ?? '').toLowerCase();
        const def = CONDITION_DEFS[conditionKey];
        if (!def) return match;
        const stacks = Math.max(1, Math.floor(Number(args[1]) || 1));
        const stackLabel = def.stackable && stacks > 1 ? ` (x${stacks})` : '';
        return `<button type="button" class="inline-effect-roll" data-inline-kind="condition" data-inline-condition="${def.key}" data-inline-stacks="${stacks}"><i class="fas fa-bolt"></i> Apply ${def.label}${stackLabel}</button>`;
      }

      if (kind === 'resource') {
        if (!actor?.id) return match;
        const direction = String(args[0] ?? '').toLowerCase() === 'loss' ? 'loss' : 'gain';
        const formula = args[1];
        if (!formula) return match;
        const resourceLabel = actor.system?.resource?.type
          ? `${String(actor.system.resource.type).charAt(0).toUpperCase()}${String(actor.system.resource.type).slice(1)}`
          : 'Resource';
        const verb = direction === 'loss' ? 'Lose' : 'Gain';
        return `<button type="button" class="inline-effect-roll" data-inline-kind="resource" data-inline-formula="${escapeHtmlAttr(formula)}" data-inline-direction="${direction}" data-inline-actor-id="${actor.id}"><i class="fas fa-dice-d20"></i> ${verb} ${escapeHtmlAttr(formula)} ${resourceLabel}</button>`;
      }

      return match;
    });
  };
  const getAreaShapeLabel = (shape) => ({
    cone: 'Cone',
    rect: 'Circle / Cube',
    ray: 'Ray',
    radius: 'Radius'
  })[String(shape ?? 'rect').trim()] ?? 'Circle / Cube';
  const getActorOwnerColor = (actor) => {
    const ownerLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
    const owner = game.users.find((user) => !user.isGM && (actor?.ownership?.[user.id] ?? actor?.ownership?.default ?? 0) >= ownerLevel)
      ?? game.users.find((user) => (actor?.ownership?.[user.id] ?? 0) >= ownerLevel)
      ?? game.users.activeGM
      ?? game.user;
    return /^#[0-9a-f]{6}$/i.test(String(owner?.color ?? '')) ? owner.color : '#5a67d8';
  };
  const getTalentsForSkill = (actor, skillKey) => [...(actor?.items ?? [])]
    .filter((item) => item.type === 'talent' && String(item.system?.skill ?? '').trim() === skillKey)
    .sort((a, b) => (Number(a.system?.tier) || 0) - (Number(b.system?.tier) || 0) || String(a.name ?? '').localeCompare(String(b.name ?? '')));
  const skillTalentsChatContent = (actor, skillKey) => {
    const talents = getTalentsForSkill(actor, skillKey);
    if (!talents.length) return '';
    const talentContent = talents.map((talent) => {
      const description = String(talent.system?.description ?? '').trim();
      const usesPerDay = Number(talent.system?.usesPerDay) || 0;
      const areaButton = configuredAreaButton(talent.system);
      return `
        <details>
          <summary>${talent.name || 'Talent'}${Number(talent.system?.tier) ? ` (Tier ${Number(talent.system?.tier)})` : ''}</summary>
          ${usesPerDay > 0 ? `<p><strong>Uses / Day:</strong> ${usesPerDay}</p>` : ''}
          ${description ? `<p>${renderChatText(description, actor)}</p>` : '<p>No description supplied.</p>'}
          ${areaButton}
          ${itemEffectsChatContent(talent, actor)}
        </details>
      `;
    }).join('');
    return `<section class="d100-chat-talents"><strong>${skillLabels[skillKey] ?? skillKey} Talents</strong>${talentContent}</section>`;
  };
  async function executeNpcAction(actor, item, { automaticAura = false, skillCheck = null } = {}) {
    if (!actor || item?.type !== 'npcAction' || item.flags?.['d100-system']?.recharging) return false;
    const dice = String(item.system?.dice ?? '').trim();
    const effectType = String(item.system?.effectType ?? 'healing');
    const effectLabel = effectType === 'healing' ? 'Healing' : `${getResistanceTypeLabel(effectType)} Damage`;
    const description = String(item.system?.description ?? '').trim();
    const messageRolls = [];
    let rollContent = '';
    let skillCheckContent = '';
    if (skillCheck) {
      messageRolls.push(skillCheck.roll);
      skillCheckContent = `
        <p><strong>${skillCheck.attributeLabel} Check</strong>: TN ${skillCheck.targetNumber} (${skillCheck.attributeValue}×10 + ${skillCheck.attributeValue} + ${skillCheck.songs} Songs - ${skillCheck.swords} Swords)</p>
        <p>Roll: ${skillCheck.roll.total} — <strong>${skillCheck.degreeInfo.label}</strong></p>
      `;
    }
    if (dice) {
      const roll = await new Roll(parseDiceExpression(dice)).evaluate();
      messageRolls.push(roll);
      rollContent = `<p><strong>${effectLabel}:</strong> ${roll.total} (${roll.formula})</p>${buildApplyEffectButton(roll.total, effectType)}`;
    }

    const recharge = Math.max(0, Math.floor(Number(item.system?.recharge) || 0));
    if (recharge > 0) {
      await item.update({
        'flags.d100-system.recharging': true,
        'flags.d100-system.rechargeProgress': 0
      });
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <p><strong>${actor.name}</strong> ${automaticAura ? 'triggers aura action' : 'uses'} <strong>${item.name}</strong> (${getActionTypeLabel(item.system?.actionType)}).</p>
        ${skillCheckContent}
        ${rollContent}
        ${recharge > 0 ? `<p><strong>Recharge:</strong> 0 / ${recharge}</p>` : ''}
        ${description ? `<p>${renderChatText(description, actor)}</p>` : ''}
        ${configuredAreaButton(item.system)}
        ${itemEffectsChatContent(item, actor)}
      `,
      rolls: messageRolls
    });
    return true;
  }
  const isAutomaticEffectSource = (item) => item?.type === 'race'
    || item?.type === 'armor' && item.system?.equipped !== false;
  const automaticEffectSyncs = new Map();
  async function normalizeAutomaticItemEffects(item) {
    if (item?.type !== 'race') return;
    for (const effect of getItemEffects(item).filter((entry) => entry.transfer)) {
      await effect.update({ transfer: false }, { d100SkipAutomaticSync: true });
    }
  }
  async function doSyncAutomaticItemEffects(item) {
    const actor = item?.actor;
    if (!actor || !isAutomaticEffectSource(item)) return;
    await normalizeAutomaticItemEffects(item);

    const existingIds = [...actor.effects]
      .filter((effect) => effect.flags?.['d100-system']?.sourceItemId === item.id || item.type === 'race' && effect.origin === item.uuid)
      .map((effect) => effect.id);
    if (existingIds.length) await actor.deleteEmbeddedDocuments('ActiveEffect', existingIds);

    const effects = getItemEffects(item)
      .filter((effect) => item.type === 'race' || !effect.transfer)
      .map((effect) => {
        const effectData = effect.toObject();
        if (item.type === 'race') effectData.transfer = false;
        effectData.flags = foundry.utils.mergeObject(effectData.flags ?? {}, {
          'd100-system': {
            sourceItemId: item.id,
            sourceEffectId: effect.id,
            automaticSource: true
          }
        });
        return effectData;
      });
    if (effects.length) await actor.createEmbeddedDocuments('ActiveEffect', effects);
  }
  async function syncAutomaticItemEffects(item) {
    const key = item?.uuid ?? item?.id;
    if (!key) return;
    const previousSync = automaticEffectSyncs.get(key) ?? Promise.resolve();
    const nextSync = previousSync.catch(() => undefined).then(() => doSyncAutomaticItemEffects(item));
    automaticEffectSyncs.set(key, nextSync);
    try {
      await nextSync;
    } finally {
      if (automaticEffectSyncs.get(key) === nextSync) automaticEffectSyncs.delete(key);
    }
  }
  async function clearAutomaticItemEffects(item) {
    const actor = item?.actor;
    if (!actor) return;
    const effectIds = [...actor.effects]
      .filter((effect) => effect.flags?.['d100-system']?.sourceItemId === item.id)
      .map((effect) => effect.id);
    if (effectIds.length) await actor.deleteEmbeddedDocuments('ActiveEffect', effectIds);
  }
  async function replaceItemEffectsFromSource(targetItem, sourceItem) {
    if (!targetItem || !sourceItem || targetItem.uuid === sourceItem.uuid) return;
    const existingEffectIds = [...targetItem.effects].map((effect) => effect.id);
    if (existingEffectIds.length) await targetItem.deleteEmbeddedDocuments('ActiveEffect', existingEffectIds, { d100SkipAutomaticSync: true });

    const effectCopies = getItemEffects(sourceItem).map((effect) => {
      const effectData = effect.toObject();
      if (targetItem.type === 'race') effectData.transfer = false;
      return effectData;
    });
    if (effectCopies.length) await targetItem.createEmbeddedDocuments('ActiveEffect', effectCopies, { d100SkipAutomaticSync: true });
  }
  async function getRaceLanguageUpdates(actor, raceSystem) {
    const knownLanguages = actor?.system?.languagesKnown ?? {};
    const fixedLanguageKeys = Object.entries(raceSystem?.languages ?? {})
      .filter(([, enabled]) => !!enabled)
      .map(([key]) => key);
    const updates = fixedLanguageKeys.reduce((acc, key) => {
      acc[`system.languagesKnown.${key}`] = true;
      return acc;
    }, {});

    const fixedLanguageSet = new Set(fixedLanguageKeys);
    const configuredChoiceGroups = Object.entries(raceSystem?.languageChoiceGroups ?? {})
      .map(([id, group], index) => ({
        id,
        label: String(group?.label ?? '').trim() || `Language Choice ${index + 1}`,
        mode: group?.mode === 'specific' ? 'specific' : 'any',
        languages: Object.entries(group?.languages ?? {})
          .filter(([, enabled]) => !!enabled)
          .map(([key]) => key)
      }));
    const legacyChoiceCount = Math.max(0, Math.floor(Number(raceSystem?.languageChoices) || 0));
    const legacyChoiceGroups = !configuredChoiceGroups.length && legacyChoiceCount
      ? Array.from({ length: legacyChoiceCount }, (_, index) => ({ id: `legacy${index}`, label: `Language Choice ${index + 1}`, mode: 'any', languages: [] }))
      : [];
    const choiceGroups = configuredChoiceGroups.length ? configuredChoiceGroups : legacyChoiceGroups;
    if (!choiceGroups.length) return updates;

    const selectedLanguageKeys = new Set(fixedLanguageKeys);
    const validChoiceGroups = choiceGroups.map((group) => {
      const allowedLanguages = group.mode === 'specific'
        ? languageOptions.filter((language) => group.languages.includes(language.key))
        : languageOptions;
      return {
        ...group,
        languageOptions: allowedLanguages.filter((language) => !selectedLanguageKeys.has(language.key) && !knownLanguages[language.key])
      };
    }).filter((group) => group.languageOptions.length);
    if (!validChoiceGroups.length) return updates;

    const fieldHtml = validChoiceGroups.map((group, index) => {
      const optionHtml = group.languageOptions.map((language) => `<option value="${language.key}">${language.label}</option>`).join('');
      return `
      <div class="form-group">
        <label>${group.label}</label>
        <select name="language${index}" data-race-language-choice>${optionHtml}</select>
      </div>
    `;
    }).join('');

    const selected = await new Promise((resolve) => {
      new Dialog({
        title: 'Choose Race Languages',
        content: `<div class="d100-system"><form>${fieldHtml}</form></div>`,
        buttons: {
          apply: {
            label: 'Apply',
            callback: (html) => {
              const form = html[0].querySelector('form');
              const formData = new foundry.applications.ux.FormDataExtended(form).object;
              const selectedKeys = Object.values(formData);
              if (new Set(selectedKeys).size !== selectedKeys.length) {
                ui.notifications.warn('Choose a different language for each Race language choice.');
                return false;
              }
              const invalidKey = selectedKeys.find((key) => selectedLanguageKeys.has(key) || knownLanguages[key]);
              if (invalidKey) {
                ui.notifications.warn(`${languageOptions.find((language) => language.key === invalidKey)?.label ?? invalidKey} is already known or already granted by this Race.`);
                return false;
              }
              resolve(formData);
            }
          }
        },
        default: 'apply',
        close: () => resolve(null),
        render: (html) => {
          const selects = [...html[0].querySelectorAll('[data-race-language-choice]')];
          const updateDisabledOptions = () => {
            const usedValues = new Set();
            selects.forEach((select) => {
              select.querySelectorAll('option').forEach((option) => {
                option.disabled = selectedLanguageKeys.has(option.value) || !!knownLanguages[option.value] || usedValues.has(option.value);
              });
              if (select.selectedOptions[0]?.disabled) {
                const replacement = [...select.options].find((option) => !option.disabled);
                if (replacement) select.value = replacement.value;
              }
              if (select.value) usedValues.add(select.value);
            });
          };
          selects.forEach((select) => select.addEventListener('change', updateDisabledOptions));
          updateDisabledOptions();
        }
      }, { classes: ['dialog', 'd100-system'] }).render(true);
    });

    if (!selected) {
      ui.notifications.warn('Choose Race languages before applying this Race.');
      return null;
    }

    Object.values(selected).forEach((key) => {
      if (languageOptions.some((language) => language.key === key)) {
        updates[`system.languagesKnown.${key}`] = true;
        selectedLanguageKeys.add(key);
      }
    });
    return updates;
  }
  const resistanceTypeOptions = [
    { value: 'bludgeoning', label: 'Bludgeoning' },
    { value: 'piercing', label: 'Piercing' },
    { value: 'slashing', label: 'Slashing' },
    { value: 'acid', label: 'Acid' },
    { value: 'cold', label: 'Cold' },
    { value: 'fire', label: 'Fire' },
    { value: 'force', label: 'Force' },
    { value: 'lightning', label: 'Lightning' },
    { value: 'necrotic', label: 'Necrotic' },
    { value: 'poison', label: 'Poison' },
    { value: 'psychic', label: 'Psychic' },
    { value: 'radiant', label: 'Radiant' },
    { value: 'thunder', label: 'Thunder' }
  ];

  const skillGroups = [
    {
      label: 'General',
      keys: ['acrobatics', 'alchemy', 'athletics', 'crafting', 'investigation', 'knowledge', 'languages', 'luck', 'magecraft', 'medicine', 'performance', 'sleight_of_hand', 'speechcraft', 'stealth', 'survival', 'vehicles'],
      allowedAttributes: ['strength', 'toughness', 'observation', 'reflex', 'majesty'],
      columns: 2
    },
    {
      label: 'Weapon',
      keys: ['heavy_weapons', 'light_weapons', 'magic_weapons', 'ranged_weapons', 'special_weapons'],
      allowedAttributes: ['strength', 'toughness', 'observation', 'reflex', 'majesty']
    },
    {
      label: 'Defense',
      keys: ['armor', 'evasion', 'shields'],
      allowedAttributes: ['strength', 'toughness', 'observation', 'reflex', 'majesty']
    },
    {
      label: 'Magic',
      keys: ['cosmic_magic', 'druidic_magic', 'elemental_magic', 'light_magic', 'shadow_magic'],
      allowedAttributes: ['observation', 'majesty']
    }
  ];

  function getDragItemData(event) {
    if (!event) return null;

    const nativeEvent = event.originalEvent ?? event;
    if (typeof DragEvent !== 'undefined' && nativeEvent instanceof DragEvent) {
      if (typeof TextEditor?.getDragEventData === 'function') {
        const dragData = TextEditor.getDragEventData(nativeEvent);
        if (dragData) return dragData;
      }
    }

    const transfer = nativeEvent?.dataTransfer ?? event?.dataTransfer;
    if (transfer && typeof transfer.getData === 'function') {
      const rawJson = transfer.getData('application/json') || transfer.getData('text/plain');
      if (rawJson) {
        try {
          return JSON.parse(rawJson);
        } catch (err) {
          return null;
        }
      }
    }

    return null;
  }

  function getResistanceTypeLabel(type) {
    const normalized = String(type ?? '').trim().toLowerCase();
    const match = resistanceTypeOptions.find((option) => option.value === normalized);
    return match ? match.label : normalized || 'Unknown';
  }

  function getResistanceSources(actor) {
    const sources = [];
    if (!actor) return sources;

    const actorSystem = actor.system ?? {};
    const itemEntries = Array.isArray(actor.items) ? actor.items : [];

    itemEntries.forEach((item) => {
      const itemSystem = item?.system ?? {};
      const isAutomaticSource = isAutomaticEffectSource(item);
      if (typeof itemSystem.resistance === 'number' && itemSystem.resistance !== 0) {
        sources.push({ source: item.name, type: 'generic', value: Number(itemSystem.resistance) || 0 });
      }

      const nestedResistanceMaps = [
        itemSystem.resistances,
        itemSystem.damageResistances,
        itemSystem.resistanceMap,
        itemSystem.effects?.resistances,
        itemSystem.effectResistances
      ];

      nestedResistanceMaps.forEach((map) => {
        if (isAutomaticSource) return;
        if (!map || typeof map !== 'object') return;
        Object.entries(map).forEach(([key, value]) => {
          const numericValue = Number(value) || 0;
          if (numericValue !== 0) {
            sources.push({ source: item.name, type: String(key), value: numericValue });
          }
        });
      });
    });

    const actorMaps = [
      actorSystem.resistance,
      actorSystem.resistanceValues,
      actorSystem.damageResistances,
      actorSystem.effectResistances,
      actorSystem.effects?.resistances
    ];

    actorMaps.forEach((map) => {
      if (!map || typeof map !== 'object') return;
      Object.entries(map).forEach(([key, value]) => {
        const numericValue = Number(value) || 0;
        if (numericValue !== 0) {
          sources.push({ source: actor.name || 'Character', type: String(key), value: numericValue });
        }
      });
    });

    return sources;
  }

  function getResistanceBaseValue(actor, damageType) {
    const normalizedType = String(damageType ?? '').trim().toLowerCase();
    if (!normalizedType) return 0;

    return getResistanceSources(actor)
      .filter((entry) => String(entry.type ?? '').trim().toLowerCase() === normalizedType)
      .reduce((total, entry) => total + (Number(entry.value) || 0), 0);
  }

  function getActorConditionEffects(actor) {
    return [...(actor?.effects ?? [])].filter((effect) => !!CONDITION_DEFS[effect.flags?.['d100-system']?.condition]);
  }

  function getActorConditionStacks(actor, conditionKey) {
    const effect = getActorConditionEffects(actor).find((entry) => entry.flags?.['d100-system']?.condition === conditionKey);
    if (!effect) return 0;
    const def = CONDITION_DEFS[conditionKey];
    if (!def?.stackable) return effect ? 1 : 0;
    return Math.max(1, Math.floor(Number(effect.flags?.['d100-system']?.stacks) || 1));
  }

  function getActorActiveConditions(actor) {
    return getActorConditionEffects(actor).map((effect) => {
      const key = effect.flags['d100-system'].condition;
      const def = CONDITION_DEFS[key];
      const stacks = def.stackable ? Math.max(1, Math.floor(Number(effect.flags['d100-system'].stacks) || 1)) : 1;
      return { key, def, stacks, effectId: effect.id };
    });
  }

  function calculateConditionOwnRollBonus(actor) {
    let songs = 0;
    let swords = 0;
    for (const { def, stacks } of getActorActiveConditions(actor)) {
      if (def.ownSwordsPerStack) swords += def.ownSwordsPerStack * stacks;
      if (def.ownSongsPerStack) songs += def.ownSongsPerStack * stacks;
    }
    return { songs, swords };
  }

  function calculateConditionMovementOverride(actor) {
    const conditions = getActorActiveConditions(actor);
    let penalty = 0;
    let forceZero = false;
    for (const { def, stacks } of conditions) {
      if (def.movementPenaltyPerStack) penalty += def.movementPenaltyPerStack * stacks;
      if (def.movementOverrideZero) forceZero = true;
    }
    return { penalty, forceZero };
  }

  function calculateAttackerConditionBonus(targetActor, { isMelee = true } = {}) {
    let songs = 0;
    let swords = 0;
    for (const { def } of getActorActiveConditions(targetActor)) {
      if (isMelee && def.attackerSongsAgainstMelee) songs += def.attackerSongsAgainstMelee;
      if (!isMelee && def.attackerSongsAgainstRanged) songs += def.attackerSongsAgainstRanged;
      if (isMelee && def.attackerSwordsAgainstMelee) swords += def.attackerSwordsAgainstMelee;
      if (!isMelee && def.attackerSwordsAgainstRanged) swords += def.attackerSwordsAgainstRanged;
    }
    return { songs, swords };
  }

  const VITAL_MODIFIER_INDICATOR_DEFS = [
    { key: 'health-buffed', vital: 'health', direction: 'positive', name: 'Health Increased', img: 'icons/svg/heal.svg' },
    { key: 'health-debuffed', vital: 'health', direction: 'negative', name: 'Health Decreased', img: 'icons/svg/downgrade.svg' },
    { key: 'resource-buffed', vital: 'resource', direction: 'positive', name: 'Resource Increased', img: 'icons/svg/upgrade.svg' },
    { key: 'resource-debuffed', vital: 'resource', direction: 'negative', name: 'Resource Decreased', img: 'icons/svg/ice-aura.svg' }
  ];

  async function syncVitalModifierIndicators(actor) {
    if (!actor) return;
    for (const def of VITAL_MODIFIER_INDICATOR_DEFS) {
      const modifier = Number(actor.system?.[def.vital]?.modifier) || 0;
      const shouldShow = def.direction === 'positive' ? modifier > 0 : modifier < 0;
      const existing = actor.effects.find((effect) => effect.flags?.['d100-system']?.vitalIndicator === def.key);
      if (shouldShow && !existing) {
        await actor.createEmbeddedDocuments('ActiveEffect', [{
          name: def.name,
          img: def.img,
          statuses: [def.key],
          flags: { 'd100-system': { vitalIndicator: def.key } }
        }]);
      } else if (!shouldShow && existing) {
        await existing.delete();
      }
    }
  }

  async function applyConditionToActor(actor, conditionKey, stacksToAdd = 1) {
    const def = CONDITION_DEFS[conditionKey];
    if (!actor || !def) return;
    const existing = getActorConditionEffects(actor).find((entry) => entry.flags?.['d100-system']?.condition === conditionKey);
    if (existing) {
      if (!def.stackable) return;
      const newStacks = Math.max(1, (Math.floor(Number(existing.flags?.['d100-system']?.stacks) || 1)) + Math.floor(stacksToAdd));
      await existing.update({ 'flags.d100-system.stacks': newStacks });
      return;
    }

    let effectData;
    if (typeof ActiveEffect.fromStatusEffect === 'function') {
      const built = await ActiveEffect.fromStatusEffect(def.key);
      effectData = built?.toObject ? built.toObject() : built;
    }
    if (!effectData) {
      effectData = { name: def.label, img: def.icon, statuses: [def.key] };
    }
    effectData.name = def.label;
    effectData.img = def.icon;
    effectData.statuses = [def.key];
    effectData.disabled = false;
    effectData.flags = foundry.utils.mergeObject(effectData.flags ?? {}, {
      'd100-system': { condition: def.key, stacks: def.stackable ? Math.max(1, Math.floor(stacksToAdd)) : 1 }
    });

    console.debug('D100 System | Applying condition', def.key, {
      registeredInConfig: !!CONFIG.statusEffects.find((entry) => entry.id === def.key),
      effectData
    });

    await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
  }

  async function removeConditionStacks(actor, conditionKey, stacksToRemove = null) {
    const existing = getActorConditionEffects(actor).find((entry) => entry.flags?.['d100-system']?.condition === conditionKey);
    if (!existing) return;
    const def = CONDITION_DEFS[conditionKey];
    const currentStacks = def.stackable ? Math.max(1, Math.floor(Number(existing.flags?.['d100-system']?.stacks) || 1)) : 1;
    if (stacksToRemove === null || stacksToRemove >= currentStacks) {
      await existing.delete();
      return;
    }
    await existing.update({ 'flags.d100-system.stacks': currentStacks - stacksToRemove });
  }

  function calculateActorTotalDefense(actor) {
    if (!actor) return 0;
    const isNpc = actor.type === 'npc';
    const baseDefense = isNpc ? Number(actor.system?.defense) || 0 : 0;
    const armorDefense = getEquippedArmorDefense(actor);
    const shieldDefense = getActiveShieldDefense(actor);
    const modifier = Number(actor.system?.defenseModifier) || 0;
    return baseDefense + armorDefense + shieldDefense + modifier;
  }

  function calculateActorTotalResistance(actor, damageType) {
    if (!actor) return 0;
    const normalizedType = String(damageType ?? '').trim().toLowerCase();
    if (!normalizedType || normalizedType === 'healing') return 0;
    const baseValue = getResistanceBaseValue(actor, normalizedType);
    const modSource = actor.system?.resistanceMod && typeof actor.system.resistanceMod === 'object' && Object.keys(actor.system.resistanceMod).length
      ? actor.system.resistanceMod
      : actor.system?.resistances;
    const modifier = Number(modSource?.[normalizedType]) || 0;
    const directValue = actor.type === 'hazard' ? (Number(actor.system?.resistance?.[normalizedType]) || 0) : 0;
    return baseValue + modifier + directValue;
  }

  function escapeHtmlAttr(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function buildApplyEffectButton(amount, damageType, trackInfo = null) {
    const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
    if (safeAmount <= 0) return '';
    const type = String(damageType ?? 'healing').trim().toLowerCase();
    const isHealing = type === 'healing';
    const label = isHealing ? 'Apply Healing to Target' : 'Apply Damage to Target';
    const trackAttrs = (isHealing && trackInfo?.healer && trackInfo?.source)
      ? ` data-track-healing="true" data-heal-healer="${escapeHtmlAttr(trackInfo.healer)}" data-heal-source="${escapeHtmlAttr(trackInfo.source)}"`
      : '';
    const fullButton = `<button type="button" data-apply-effect data-apply-amount="${safeAmount}" data-apply-type="${type}"${trackAttrs}>${label}</button>`;
    if (isHealing) return `<p>${fullButton}</p>`;
    const halfAmount = Math.floor(safeAmount / 2);
    const halfButton = halfAmount > 0
      ? ` <button type="button" data-apply-effect data-apply-amount="${safeAmount}" data-apply-type="${type}" data-apply-half="true">Apply Half Damage to Target</button>`
      : '';
    return `<p>${fullButton}${halfButton}</p>`;
  }

  async function recordHealingTrackerEntry(actor, healer, source) {
    if (!actor || !healer || !source) return;
    const entries = Array.isArray(actor.system?.healing) ? foundry.utils.deepClone(actor.system.healing) : [];
    const existing = entries.find((entry) => String(entry?.healer ?? '').trim() === healer && String(entry?.source ?? '').trim() === source);
    if (existing) {
      existing.times = (Number(existing.times) || 0) + 1;
    } else {
      entries.push({ healer, source, times: 1, reset: 'short-rest' });
    }
    await actor.update({ 'system.healing': entries });
  }

  const DEFENSE_IGNORING_DAMAGE_TYPES = ['poison', 'psychic'];

  async function promptScarRoll(actor) {
    if (!actor) return;
    const chosen = await new Promise((resolve) => {
      new Dialog({
        title: `Scar Roll: ${actor.name}`,
        content: `
          <div class="d100-system">
            <form>
              <div class="form-group">
                <label><input type="checkbox" name="criticalHit" /> Damage was from a Critical Hit (+1)</label>
              </div>
              <div class="form-group">
                <label><input type="checkbox" name="monstrousOrHigherLevel" /> Attacker was Monstrous or 2+ levels higher than ${actor.name} (+1)</label>
              </div>
            </form>
          </div>
        `,
        buttons: {
          roll: {
            label: 'Roll d10',
            callback: (dialogHtml) => {
              const root = dialogHtml?.[0] ?? dialogHtml;
              const form = root?.querySelector ? root.querySelector('form') : root;
              const formData = new foundry.applications.ux.FormDataExtended(form);
              resolve(formData.object);
            }
          }
        },
        default: 'roll',
        close: () => resolve(null)
      }, { classes: ['dialog', 'd100-system'] }).render(true);
    });

    if (!chosen) return;

    const criticalHit = !!chosen.criticalHit;
    const monstrousOrHigherLevel = !!chosen.monstrousOrHigherLevel;
    const modifier = (criticalHit ? 1 : 0) + (monstrousOrHigherLevel ? 1 : 0);

    const roll = await new Roll('1d10').evaluate();
    const total = roll.total + modifier;
    const gainsScar = total >= 10;
    const modifierLabels = [criticalHit ? 'Critical Hit' : null, monstrousOrHigherLevel ? 'Monstrous/Higher Level' : null].filter(Boolean);

    let scarNote = '';
    if (gainsScar) {
      const toughness = Number(actor.system.attributes?.toughness) || 1;
      const level = Number(actor.system.level) || 1;
      const scarBonusLevels = [5, 9, 13, 17];
      const maxScars = 1 + toughness + scarBonusLevels.filter((value) => value <= level).length;
      const currentScars = Math.min(maxScars, Math.max(0, Number(actor.system.scars) || 0));
      const newScars = Math.min(maxScars, currentScars + 1);
      if (newScars > currentScars) {
        await actor.update({ 'system.scars': newScars });
        scarNote = `<p><strong>${actor.name}</strong> gains a Scar (${newScars} / ${maxScars}).</p>`;
      } else {
        scarNote = `<p><strong>${actor.name}</strong> would gain a Scar, but is already at the maximum (${maxScars}).</p>`;
      }
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <p><strong>${actor.name}</strong> rolls for a Scar while Dying.</p>
        <p>Roll: ${roll.total}${modifier ? ` + ${modifier} (${modifierLabels.join(', ')})` : ''} = <strong>${total}</strong></p>
        <p>${gainsScar ? '<strong>Result of 10+: Gains a Scar.</strong>' : 'No Scar gained.'}</p>
        ${scarNote}
      `,
      rolls: [roll]
    });
  }

  function getConcentrationDamageThreshold(level) {
    const normalizedLevel = Math.max(1, Math.floor(Number(level) || 1));
    if (normalizedLevel >= 17) return 48;
    if (normalizedLevel >= 13) return 36;
    if (normalizedLevel >= 9) return 24;
    if (normalizedLevel >= 5) return 12;
    return 6;
  }

  async function promptConcentrationCheck(actor, damageAmount) {
    if (!actor?.isOwner) return;
    const weaponMagicSkillKeys = ['light_weapons', 'heavy_weapons', 'ranged_weapons', 'special_weapons', 'magic_weapons', 'cosmic_magic', 'druidic_magic', 'elemental_magic', 'light_magic', 'shadow_magic'];
    const skillOptions = weaponMagicSkillKeys
      .map((key) => `<option value="${key}">${skillLabels[key] ?? key}</option>`)
      .join('');

    const chosen = await new Promise((resolve) => {
      new Dialog({
        title: `Concentration Check: ${actor.name}`,
        content: `
          <div class="d100-system">
            <p>${actor.name} took ${damageAmount} damage while Concentrating and must succeed a Toughness Check using a Weapon or Magic Skill to maintain it.</p>
            <form>
              <div class="form-group">
                <label>Skill</label>
                <select name="skill">${skillOptions}</select>
              </div>
              <div class="form-group">
                <label>Songs</label>
                <input type="number" name="songs" value="0" min="0" />
              </div>
              <div class="form-group">
                <label>Swords</label>
                <input type="number" name="swords" value="0" min="0" />
              </div>
            </form>
          </div>
        `,
        buttons: {
          roll: {
            label: 'Roll d100',
            callback: (dialogHtml) => {
              const root = dialogHtml?.[0] ?? dialogHtml;
              const form = root?.querySelector ? root.querySelector('form') : root;
              const formData = new foundry.applications.ux.FormDataExtended(form);
              resolve(formData.object);
            }
          }
        },
        default: 'roll',
        close: () => resolve(null)
      }, { classes: ['dialog', 'd100-system'] }).render(true);
    });

    if (!chosen) return;

    const skillKey = chosen.skill;
    const songs = Math.max(0, Number(chosen.songs) || 0);
    const swords = Math.max(0, Number(chosen.swords) || 0);
    const attributeValue = Number(actor.system?.attributes?.toughness) || 0;
    const skillValue = Number(actor.system?.skills?.[skillKey]) || 0;
    const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + skillValue + songs - swords));
    const roll = await new Roll('1d100').evaluate();
    const degreeInfo = getDegreeInfo(roll.total, targetNumber);
    const succeeded = degreeInfo.type === 'success' || degreeInfo.type === 'critical-success';

    if (!succeeded) {
      await removeConditionStacks(actor, 'concentration', null);
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <p><strong>${actor.name}</strong> makes a Concentration Check (Toughness + ${skillLabels[skillKey] ?? skillKey}) after taking ${damageAmount} damage.</p>
        <p>TN: ${targetNumber} (${attributeValue}×10 + ${skillValue} + ${songs} Songs - ${swords} Swords)</p>
        <p>Roll: ${roll.total}</p>
        <p><strong>${degreeInfo.label}</strong></p>
        <p>${succeeded ? 'Concentration is maintained.' : '<strong>Concentration is lost.</strong>'}</p>
      `,
      rolls: [roll]
    });
  }

  async function applyEffectToActor(actor, amount, damageType, { half = false } = {}) {
    const isHealing = damageType === 'healing';
    const health = actor.system?.health ?? {};
    const currentValue = Number(health.value) || 0;
    const maxValue = Number(health.max) || 0;
    let finalAmount = Math.max(0, Math.floor(Number(amount) || 0));
    let defenseApplied = 0;
    let resistanceApplied = 0;

    if (!isHealing) {
      if (half) finalAmount = Math.floor(finalAmount / 2);
      const normalizedType = String(damageType ?? '').trim().toLowerCase();
      defenseApplied = DEFENSE_IGNORING_DAMAGE_TYPES.includes(normalizedType) ? 0 : Math.max(0, calculateActorTotalDefense(actor));
      resistanceApplied = Math.max(0, calculateActorTotalResistance(actor, damageType));
      finalAmount = Math.max(0, finalAmount - defenseApplied - resistanceApplied);
    }

    const newValue = isHealing
      ? Math.min(maxValue, currentValue + finalAmount)
      : Math.max(0, currentValue - finalAmount);

    await actor.update({ 'system.health.value': newValue });

    const triggersScarRoll = !isHealing && finalAmount > 0 && (currentValue <= 0 || newValue <= 0);
    if (triggersScarRoll && actor.isOwner) {
      await promptScarRoll(actor);
    }

    if (!isHealing && finalAmount > 0 && actor.isOwner) {
      const isConcentrating = getActorActiveConditions(actor).some((entry) => entry.key === 'concentration');
      if (isConcentrating) {
        const threshold = getConcentrationDamageThreshold(actor.system?.level);
        if (finalAmount >= threshold) {
          promptConcentrationCheck(actor, finalAmount);
        }
      }
    }

    return { finalAmount, defenseApplied, resistanceApplied, newValue, maxValue, isHealing, half: !isHealing && half };
  }

  function getDegreeInfo(roll, targetNumber) {
    if (roll === 1) {
      return {
        type: 'critical-success',
        degrees: 0,
        label: 'Critical Success'
      };
    }

    if (roll === 100) {
      return {
        type: 'critical-failure',
        degrees: 0,
        label: 'Critical Failure'
      };
    }

    if (roll <= targetNumber) {
      const delta = targetNumber - roll;
      const degrees = Math.floor(delta / 10);
      return {
        type: 'success',
        degrees,
        label: degrees === 0 ? 'Success' : `${degrees} Degree${degrees === 1 ? '' : 's'} of Success`
      };
    }

    const delta = roll - targetNumber;
    const degrees = Math.floor(delta / 10);
    return {
      type: 'failure',
      degrees,
      label: degrees === 0 ? 'Failure' : `${degrees} Degree${degrees === 1 ? '' : 's'} of Failure`
    };
  }

  async function processStartOfTurnConditions(actor) {
    if (!actor) return;
    for (const { key, def, stacks } of getActorActiveConditions(actor)) {
      if (def.dot) {
        const formula = `${stacks}${def.dot.die}`;
        const roll = await new Roll(formula).evaluate();
        const result = await applyEffectToActor(actor, roll.total, def.dot.damageType);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>${actor.name}</strong> takes <strong>${result.finalAmount}</strong> ${getResistanceTypeLabel(def.dot.damageType)} damage from <strong>${def.label}</strong> (${roll.total} rolled, ${formula}).</p><p>Health: ${result.newValue} / ${result.maxValue}</p>`,
          rolls: [roll]
        });
      }
    }
  }

  async function processEndOfTurnConditions(actor) {
    if (!actor) return;
    for (const { key, def, stacks } of getActorActiveConditions(actor)) {
      if (!def.endOfTurnSave) continue;
      const saveDef = def.endOfTurnSave;

      if (key === 'dazed') {
        await removeConditionStacks(actor, key, 1);
      }

      const attributeKey = saveDef.attribute;
      if (!attributeKey) {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>${actor.name}</strong> may attempt a ${saveDef.label ?? 'Save'} to end <strong>${def.label}</strong> (DM adjudicates the roll).</p>`
        });
        continue;
      }

      const attributeValue = Number(actor.system?.attributes?.[attributeKey]) || 0;
      const targetNumber = Math.max(1, Math.min(100, attributeValue * 10));
      const roll = await new Roll('1d100').evaluate();
      const degreeInfo = getDegreeInfo(roll.total, targetNumber);
      const succeeded = degreeInfo.type === 'success' || degreeInfo.type === 'critical-success';

      let outcomeNote = '';
      if (succeeded) {
        if (saveDef.removesAll) {
          await removeConditionStacks(actor, key, null);
          outcomeNote = `removes all stacks of <strong>${def.label}</strong>`;
        } else if (saveDef.removeByDegrees) {
          const toRemove = 1 + (degreeInfo.degrees || 0);
          await removeConditionStacks(actor, key, toRemove);
          outcomeNote = `removes ${toRemove} stack(s) of <strong>${def.label}</strong>`;
        } else {
          await removeConditionStacks(actor, key, 1);
          outcomeNote = `removes 1 stack of <strong>${def.label}</strong>`;
        }
      } else {
        outcomeNote = `does not remove <strong>${def.label}</strong>`;
      }

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `
          <p><strong>${actor.name}</strong> makes an end-of-turn ${attributeLabels[attributeKey] ?? attributeKey} Save against <strong>${def.label}</strong>.</p>
          <p>TN: ${targetNumber}. Roll: ${roll.total}. <strong>${degreeInfo.label}</strong></p>
          <p>${succeeded ? 'Success' : 'Failure'} — ${outcomeNote}.</p>
        `,
        rolls: [roll]
      });
    }
  }


  function calculateHealthMax(actor) {
    const system = actor?.system ?? {};
    if (actor?.type === 'npc' || actor?.type === 'hazard') {
      return Math.max(0, (Number(system.health?.max) || 0) + (Number(system.health?.modifier) || 0));
    }
    const level = Math.max(1, Number(system.level) || 1);
    const baseHealth = Number(system.baseHealth) || 0;
    const toughness = Number(system.attributes?.toughness) || 0;
    const modifier = Number(system.health?.modifier) || 0;
    const toughnessBonus = toughness >= 6 ? 2 : 0;

    let maxHealth = baseHealth + toughness + toughnessBonus;
    if (level > 1) {
      const growthPerLevel = Math.floor(baseHealth / 2) + toughnessBonus;
      maxHealth += (level - 1) * growthPerLevel;
    }

    return Math.max(0, maxHealth + modifier);
  }

  class D100Actor extends Actor {
    prepareDerivedData() {
      super.prepareDerivedData();
      if (!this.system) return;

      if (this.system.health && typeof this.system.health === 'object') {
        this.system.health.max = calculateHealthMax(this);
      }

      if (this.system.resource && typeof this.system.resource === 'object') {
        const resourceModifier = Number(this.system.resource.modifier) || 0;
        this.system.resource.max = Math.max(0, (Number(this.system.level) || 1) * 5 + resourceModifier);
      }
    }
  }

  class D100Combat extends Combat {
    _isNpcTurn(combatant) {
      return combatant?.actor?.type === 'npc';
    }

    getTurnAllowance(combatant) {
      if (!this._isNpcTurn(combatant)) return 1;
      return Math.max(1, Math.floor(Number(combatant.actor?.system?.turnsPerRound) || 1));
    }

    _getCompletedTurnCounts() {
      const storedRound = Number(this.flags?.['d100-system']?.completedTurnRound);
      if (!Number.isFinite(storedRound) || storedRound !== Number(this.round)) return {};
      const storedCounts = this.flags?.['d100-system']?.completedTurnCounts;
      return storedCounts && typeof storedCounts === 'object'
        ? Object.fromEntries(Object.entries(storedCounts).map(([id, value]) => [id, Math.max(0, Number(value) || 0)]))
        : {};
    }

    _getUnactedTurns(completedTurnCounts = {}) {
      return this.turns.filter((combatant) => !combatant.defeated
        && (Number(completedTurnCounts[combatant.id]) || 0) < this.getTurnAllowance(combatant));
    }

    _getSelectableTurns(currentCombatant, completedTurnCounts = {}) {
      const unactedTurns = this._getUnactedTurns(completedTurnCounts)
        .filter((combatant) => combatant.id !== currentCombatant?.id);
      if (!currentCombatant || !unactedTurns.length) return unactedTurns;

      const oppositeSideIsNpc = !this._isNpcTurn(currentCombatant);
      const oppositeSideTurns = unactedTurns.filter((combatant) => this._isNpcTurn(combatant) === oppositeSideIsNpc);
      return oppositeSideTurns.length ? oppositeSideTurns : unactedTurns;
    }

    getEligibleNextCombatantIds() {
      const activeTurns = this.turns.filter((combatant) => !combatant.defeated);
      const combatStarted = !!this.flags?.['d100-system']?.combatStarted;
      if (!combatStarted) return activeTurns.map((combatant) => combatant.id);

      const completedTurnCounts = this._getCompletedTurnCounts();
      if (this.combatant) {
        completedTurnCounts[this.combatant.id] = (Number(completedTurnCounts[this.combatant.id]) || 0) + 1;
      }
      const lastTurnWasNpc = this.flags?.['d100-system']?.lastTurnWasNpc;
      const unactedTurns = this._getUnactedTurns(completedTurnCounts)
        .filter((combatant) => combatant.id !== this.combatant?.id);
      const oppositeSideTurns = typeof lastTurnWasNpc === 'boolean'
        ? unactedTurns.filter((combatant) => this._isNpcTurn(combatant) !== lastTurnWasNpc)
        : [];
      const selectableTurns = oppositeSideTurns.length ? oppositeSideTurns : unactedTurns;
      return selectableTurns.map((combatant) => combatant.id);
    }

    getUnactedCombatantIds() {
      const completedTurnCounts = this._getCompletedTurnCounts();
      if (this.flags?.['d100-system']?.combatStarted && this.combatant) {
        completedTurnCounts[this.combatant.id] = (Number(completedTurnCounts[this.combatant.id]) || 0) + 1;
      }
      return this._getUnactedTurns(completedTurnCounts).map((combatant) => combatant.id);
    }

    getRemainingTurnCount(combatant, includeActiveTurn = true) {
      if (!combatant) return 0;
      const completed = Number(this._getCompletedTurnCounts()[combatant.id]) || 0;
      const activeTurn = includeActiveTurn && this.flags?.['d100-system']?.combatStarted && this.combatant?.id === combatant.id ? 1 : 0;
      return Math.max(0, this.getTurnAllowance(combatant) - completed - activeTurn);
    }

    async _advanceNpcActionRecharge(combatant) {
      if (!this._isNpcTurn(combatant)) return;
      const actions = combatant.actor.items.filter((item) => item.type === 'npcAction' && item.flags?.['d100-system']?.recharging);
      for (const action of actions) {
        const recharge = Math.max(0, Math.floor(Number(action.system?.recharge) || 0));
        if (!recharge) continue;
        const progress = Math.max(0, Math.floor(Number(action.flags?.['d100-system']?.rechargeProgress) || 0));
        const nextProgress = Math.min(recharge, progress + 1);
        await action.update({
          'flags.d100-system.rechargeProgress': nextProgress,
          'flags.d100-system.recharging': nextProgress < recharge
        });
      }
    }

    async selectCombatantTurn(nextCombatantId) {
      const turns = this.turns.filter((combatant) => !combatant.defeated);
      if (!turns.length) return this;

      if (!this.getEligibleNextCombatantIds().includes(nextCombatantId)) return this;

      await this._advanceNpcActionRecharge(this.combatants.get(nextCombatantId));
      const documentTurn = this.turns.findIndex((combatant) => combatant.id === nextCombatantId);
      return this.update({
        turn: documentTurn,
        'flags.d100-system.combatStarted': true,
        'flags.d100-system.lastTurnWasNpc': this._isNpcTurn(this.combatants.get(nextCombatantId))
      });
    }

    async completeActiveTurn() {
      const activeTurns = this.turns.filter((combatant) => !combatant.defeated);
      const currentCombatant = this.combatant;
      if (!currentCombatant || !activeTurns.some((combatant) => combatant.id === currentCombatant.id)) return this;

      if (this._isNpcTurn(currentCombatant) && currentCombatant.actor.system?.auraActions) {
        const auraActionLimit = Math.max(0, Math.floor(Number(currentCombatant.actor.system?.auraActionCount) || 0));
        const availableAuraActions = currentCombatant.actor.items
          .filter((item) => item.type === 'npcAction' && item.system?.auraAction && !item.flags?.['d100-system']?.recharging)
          .slice(0, auraActionLimit);
        if (availableAuraActions.length) {
          const randomAction = availableAuraActions[Math.floor(Math.random() * availableAuraActions.length)];
          await executeNpcAction(currentCombatant.actor, randomAction, { automaticAura: true });
        }
      }

      const completedTurnCounts = this._getCompletedTurnCounts();
      completedTurnCounts[currentCombatant.id] = (Number(completedTurnCounts[currentCombatant.id]) || 0) + 1;
      const roundIsComplete = activeTurns.every((combatant) => (Number(completedTurnCounts[combatant.id]) || 0) >= this.getTurnAllowance(combatant));
      const actedIds = activeTurns
        .filter((combatant) => (Number(completedTurnCounts[combatant.id]) || 0) >= this.getTurnAllowance(combatant))
        .map((combatant) => combatant.id);

      if (roundIsComplete) {
        await this.update({
          turn: null,
          'flags.d100-system.actedCombatants': [],
          'flags.d100-system.-=completedTurnCounts': null,
          'flags.d100-system.-=completedTurnRound': null,
          'flags.d100-system.combatStarted': false,
          'flags.d100-system.lastTurnWasNpc': null
        });
        return this.update({ round: Math.max(1, Number(this.round) || 1) + 1, turn: null });
      }

      return this.update({
        turn: null,
        'flags.d100-system.actedCombatants': actedIds,
        'flags.d100-system.completedTurnCounts': completedTurnCounts,
        'flags.d100-system.completedTurnRound': Number(this.round),
        'flags.d100-system.combatStarted': true,
        'flags.d100-system.lastTurnWasNpc': this._isNpcTurn(currentCombatant)
      });
    }

    async nextTurn() {
      return this;
    }
  }

  class D100ActorSheet extends ActorSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['d100-system', 'sheet', 'actor'],
        template: 'systems/d100-system/templates/actor/actor-sheet.hbs',
        width: 720,
        height: 760,
        tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'summary' }]
      });
    }

    static MIN_WIDTH = 750;
    static MIN_HEIGHT = 760;

    setPosition(position = {}) {
      if (position.width !== undefined) {
        position.width = position.width === 'auto' ? position.width : Math.max(D100ActorSheet.MIN_WIDTH, Number(position.width) || 0);
      }
      if (position.height !== undefined) {
        position.height = position.height === 'auto' ? position.height : Math.max(D100ActorSheet.MIN_HEIGHT, Number(position.height) || 0);
      }
      return super.setPosition(position);
    }

    async _updateObject(event, formData) {
      const isNpc = this.actor.type === 'npc';
      const hasLevelField = Object.prototype.hasOwnProperty.call(formData ?? {}, 'system.level');
      const oldLevel = Math.max(1, Math.floor(Number(this.actor.system.level) || 1));

      await super._updateObject(event, formData);

      if (isNpc && hasLevelField) {
        const newLevel = Math.max(1, Math.floor(Number(this.actor.system.level) || 1));
        if (newLevel !== oldLevel) {
          const category = [...(this.actor.items ?? [])]
            .filter((item) => item.type === 'category')
            .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
            .slice(0, 1)[0];
          if (category) {
            await this._reconcileCategoryTraitChoices(category, oldLevel, newLevel);
          }
        }
      }
    }

    getData() {
      const context = super.getData();
      const isNpc = context.actor.type === 'npc';
      const isCharacter = context.actor.type === 'character';
      const attributes = context.actor.system.attributes ?? {};
      const skills = context.actor.system.skills ?? {};
      const resource = context.actor.system.resource ?? {};
      const health = context.actor.system.health ?? {};
      const isEditMode = !!this._editMode;
      const resourceType = resourceOptions.includes(resource.type) ? resource.type : 'adrenaline';
      const resourceValue = Number(resource.value) || 0;
      const resourceModifier = Number(resource.modifier) || 0;
      const movementValue = (Number(context.actor.system.movement) || 0) + (Number(context.actor.system.movementModifier) || 0);
      const conditionMovement = calculateConditionMovementOverride(context.actor);
      const movementValueAfterConditions = conditionMovement.forceZero
        ? 0
        : Math.max(0, movementValue - conditionMovement.penalty);
      const armorDefense = getEquippedArmorDefense(context.actor);
      const shieldDefense = getActiveShieldDefense(context.actor);
      const baseDefense = isNpc ? Number(context.actor.system.defense) || 0 : 0;
      const defenseValue = baseDefense + armorDefense + shieldDefense + (Number(context.actor.system.defenseModifier) || 0);
      const resourceMax = Math.max(0, (Number(context.actor.system.level) || 1) * 5 + resourceModifier);
      const resourcePercent = resourceMax > 0 ? Math.min(100, Math.max(0, (resourceValue / resourceMax) * 100)) : 0;
      const healthValue = Number(health.value) || 0;
      const healthMax = calculateHealthMax(context.actor);
      const healthPercent = healthMax > 0 ? Math.min(100, Math.max(0, (healthValue / healthMax) * 100)) : 0;
      const toughness = Number(attributes.toughness) || 1;
      const level = Number(context.actor.system.level ?? context.actor.system.challenge) || 1;
      const scarBonusLevels = [5, 9, 13, 17];
      const scarMax = 1 + toughness + scarBonusLevels.filter((value) => value <= level).length;
      const scarValue = Math.min(scarMax, Math.max(0, Number(context.actor.system.scars) || 0));
      const actorFlagState = this.actor?.flags?.['d100-system'] ?? {};
      const activeAttributeTab = this._activeAttributeTab ?? actorFlagState.activeAttributeTab ?? 'attributes';
      const storedDetailTab = this._activeDetailTab ?? actorFlagState.activeDetailTab ?? 'vitals';
      const activeDetailTab = isNpc && storedDetailTab === 'healing' ? 'vitals' : storedDetailTab;

      const resistanceModSource = context.actor.system.resistanceMod && typeof context.actor.system.resistanceMod === 'object' && Object.keys(context.actor.system.resistanceMod).length
        ? context.actor.system.resistanceMod
        : context.actor.system.resistances;
      const resistanceMap = resistanceModSource && typeof resistanceModSource === 'object'
        ? Object.entries(resistanceModSource)
            .reduce((acc, [key, value]) => {
              acc[String(key).trim().toLowerCase()] = Number(value) || 0;
              return acc;
            }, {})
        : {};

      const resistanceRows = resistanceTypeOptions.map((option) => {
        const type = String(option.value).trim().toLowerCase();
        const modifier = Number(resistanceMap[type]) || 0;
        const baseValue = getResistanceBaseValue(context.actor, type);
        const totalValue = baseValue + modifier;
        return {
          type,
          modifier,
          baseValue,
          totalValue,
          label: option.label
        };
      });

      const healingEntries = Array.isArray(context.actor.system.healing)
        ? context.actor.system.healing.map((entry) => ({
            healer: String(entry?.healer ?? '').trim(),
            source: String(entry?.source ?? '').trim(),
            times: Number(entry?.times) || 0,
            reset: entry?.reset === 'long-rest' ? 'long-rest' : 'short-rest'
          }))
        : [];
      const activeEffects = [...(context.actor.effects ?? [])]
        .filter((effect) => !CONDITION_DEFS[effect.flags?.['d100-system']?.condition])
        .filter((effect) => !effect.flags?.['d100-system']?.vitalIndicator)
        .map((effect) => ({
          id: effect.id,
          name: effect.name || 'Active Effect',
          img: effect.img,
          disabled: !!effect.disabled,
          typeLabel: getEffectTypeLabel(effect),
          quantity: Math.max(0, Number(effect.flags?.['d100-system']?.quantity) || 1),
          sourceItemName: ''
        }));
      const transferredItemEffects = [...(context.actor.items ?? [])]
        .filter((item) => isAutomaticEffectSource(item) && item.type !== 'race')
        .flatMap((item) => getItemEffects(item)
          .filter((effect) => effect.transfer)
          .map((effect) => ({
            id: `source-${item.id}-${effect.id}`,
            name: effect.name || 'Active Effect',
            img: effect.img,
            disabled: !!effect.disabled,
            typeLabel: getEffectTypeLabel(effect),
            quantity: Math.max(0, Number(effect.flags?.['d100-system']?.quantity) || 1),
            sourceItemName: item.name || 'Item'
          })));
      activeEffects.push(...transferredItemEffects);
      const enabledEffects = activeEffects.filter((effect) => !effect.disabled);
      const inactiveEffects = activeEffects.filter((effect) => effect.disabled);

      const system = foundry.utils.deepClone(context.actor.system);
      system.level = level;
      if (isNpc) system.turnsPerRound = Math.max(1, Math.floor(Number(system.turnsPerRound) || 1));
      system.health = {
        ...system.health,
        value: healthValue,
        modifier: Number(health.modifier) || 0,
        max: Number(health.max) || 0
      };
      system.resource = {
        ...system.resource,
        value: resourceValue,
        modifier: resourceModifier
      };
      system.defenseModifier = Number(context.actor.system.defenseModifier) || 0;
      system.movementModifier = Number(context.actor.system.movementModifier) || 0;
      context.system = system;
      context.isNpc = isNpc;
      context.isCharacter = isCharacter;
      context.npcRoleOptions = npcRoleOptions;
      context.npcTraitItems = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'trait')
        .map((item) => ({ id: item.id, name: item.name || 'Trait', description: String(item.system?.description ?? '').trim(), pointCost: Math.max(0, Math.floor(Number(item.system?.traitPointCost) || 0)) }));
      context.traitPointTotal = context.npcTraitItems.reduce((sum, item) => sum + item.pointCost, 0);
      context.traitPointBase = Math.max(0, getLevelProgression(level).traitPoints);
      context.traitPointModifier = Math.floor(Number(context.actor.system.traitPointModifier) || 0);
      context.traitPointMax = Math.max(0, context.traitPointBase + context.traitPointModifier);
      const activeCategory = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'category')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .slice(0, 1)[0];
      context.activeCategory = activeCategory;
      context.hasCategory = !!(activeCategory || context.actor.system.category);
      const categoryTraitChoices = context.actor.system.categoryTraitChoices ?? {};
      context.categoryTraitBuckets = categoryTraitBucketDefs
        .filter((bucket) => bucket.level <= level)
        .map((bucket) => {
          const available = Array.isArray(activeCategory?.system?.[bucket.field]) ? activeCategory.system[bucket.field] : [];
          const choice = categoryTraitChoices[bucket.key];
          return {
            key: bucket.key,
            label: bucket.label,
            hasOptions: available.length > 0,
            chosen: choice ? { uuid: choice.uuid, name: choice.name || 'Trait', description: String(choice.description ?? '').trim() } : null
          };
        })
        .filter((bucket) => bucket.hasOptions);
      context.weaponTechniqueItems = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'weaponTechnique')
        .map((item) => {
          const cost = Math.max(0, Math.floor(Number(item.system?.resourceCostToBegin) || 0));
          return { id: item.id, name: cost ? `${item.name} (${cost} Resource)` : item.name };
        });
      const activeTechniqueState = context.actor.system.activeWeaponTechnique ?? {};
      const activeTechniqueItem = activeTechniqueState.itemId ? context.actor.items.get(activeTechniqueState.itemId) : null;
      if (activeTechniqueItem && activeTechniqueItem.type === 'weaponTechnique') {
        const currentStage = Math.min(3, Math.max(1, Number(activeTechniqueState.stage) || 1));
        const chosenOptions = activeTechniqueState.chosenOptions ?? {};
        const stages = [];
        for (let stageNumber = 1; stageNumber <= currentStage; stageNumber++) {
          const stageKey = String(stageNumber);
          const stageData = activeTechniqueItem.system?.stages?.[stageKey] ?? {};
          const chosenOptionKey = String(chosenOptions[stageKey] ?? '');
          const options = Object.entries(stageData.options ?? {}).map(([key, option]) => ({
            key,
            name: option?.name || `Option ${key}`,
            description: String(option?.description ?? '').trim(),
            chosen: key === chosenOptionKey
          }));
          stages.push({
            stageNumber,
            stageKey,
            name: stageData.name || `Stage ${stageKey}`,
            isCurrent: stageNumber === currentStage,
            resourceCostToAdvance: Math.max(0, Math.floor(Number(stageData.resourceCostToAdvance) || 0)),
            options,
            chosenOption: options.find((option) => option.chosen) ?? null
          });
        }
        context.activeWeaponTechnique = {
          itemId: activeTechniqueItem.id,
          itemName: activeTechniqueItem.name,
          skillLabel: skillLabels[activeTechniqueItem.system?.skill] ?? activeTechniqueItem.system?.skill,
          stage: currentStage,
          isFinalStage: currentStage === 3,
          stages
        };
      } else {
        context.activeWeaponTechnique = null;
      }
      context.auraActionCount = Math.max(0, Math.floor(Number(context.actor.system.auraActionCount) || 0));
      context.npcActionItems = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'npcAction' && item.system?.auraAction)
        .slice(0, context.auraActionCount)
        .map((item) => ({ id: item.id, name: item.name || 'NPC Action', description: String(item.system?.description ?? '').trim() }));
      context.npcCombatActions = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'npcAction' && !item.system?.auraAction)
        .map((item) => {
          const recharge = Math.max(0, Math.floor(Number(item.system?.recharge) || 0));
          const recharging = recharge > 0 && !!item.flags?.['d100-system']?.recharging;
          const rechargeProgress = recharging
            ? Math.min(recharge, Math.max(0, Math.floor(Number(item.flags?.['d100-system']?.rechargeProgress) || 0)))
            : recharge;
          const effectType = String(item.system?.effectType ?? 'healing');
          return {
            id: item.id,
            name: item.name || 'NPC Action',
            range: Number(item.system?.range) || 0,
            actionTypeLabel: getActionTypeLabel(item.system?.actionType),
            dice: String(item.system?.dice ?? '').trim(),
            effectLabel: effectType === 'healing' ? 'Healing' : `${getResistanceTypeLabel(effectType)} Damage`,
            recharge,
            rechargeProgress,
            rechargePercent: recharge > 0 ? Math.min(100, (rechargeProgress / recharge) * 100) : 0,
            hasRecharge: recharge > 0,
            usable: !recharging
          };
        });
      context.movementValue = movementValueAfterConditions;
      context.baseMovementValue = movementValue;
      context.defenseValue = defenseValue;
      context.armorDefense = armorDefense;
      context.shieldDefense = shieldDefense;
      const activeCombat = game.combat;
      let activeCombatant = null;
      if (activeCombat) {
        const tokenId = context.actor.token?.id ?? context.actor.getActiveTokens?.()[0]?.id ?? null;
        activeCombatant = (tokenId && activeCombat.combatants.find((c) => c.tokenId === tokenId))
          ?? activeCombat.combatants.find((c) => c.actorId === context.actor.id)
          ?? null;
      }
      context.hasActiveCombat = !!activeCombatant;
      context.combatantId = activeCombatant?.id ?? null;
      context.reactionUsed = !!activeCombatant?.flags?.['d100-system']?.reactionUsed;
      context.scarMax = scarMax;
      context.scarValue = scarValue;
      context.scarPips = Array.from({ length: scarMax }, (_, index) => ({
        index,
        active: index < scarValue
      }));
      context.resistanceRows = resistanceRows;
      context.resistanceTypeOptions = resistanceTypeOptions;
      context.healingEntries = healingEntries;
      context.enabledEffects = enabledEffects;
      context.inactiveEffects = inactiveEffects;
      context.activeConditions = getActorActiveConditions(context.actor).map(({ key, def, stacks, effectId }) => ({
        key, effectId, stacks,
        label: def.label,
        icon: def.icon,
        description: def.description,
        stackable: !!def.stackable
      }));
      context.conditionOptions = CONDITION_LIST.map((def) => ({ key: def.key, label: def.label }));
      context.activeAttributeTab = activeAttributeTab;
      context.activeDetailTab = activeDetailTab;
      context.isEditMode = isEditMode;
      context.professionItems = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'profession')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .slice(0, 1);
      const activeProfession = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'profession')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .slice(0, 1)[0];
      const professionFeatureMap = activeProfession?.system?.features ?? {};
      const currentLevel = Math.max(1, Number(context.actor.system.level) || 1);
      context.professionFeatures = [1, 3, 5, 7, 9]
        .map((level) => {
          const rawEntry = professionFeatureMap[String(level)] ?? professionFeatureMap[level] ?? {};
          const normalized = typeof rawEntry === 'string'
            ? { title: '', text: rawEntry, resourceGain: 0, resourceLoss: 0 }
            : {
                title: rawEntry?.title ?? '',
                text: rawEntry?.text ?? '',
                actionType: rawEntry?.actionType ?? 'major',
                resourceGain: Number(rawEntry?.resourceGain ?? rawEntry?.gain ?? 0) || 0,
                resourceLoss: Number(rawEntry?.resourceLoss ?? rawEntry?.loss ?? 0) || 0,
                areaOfEffect: !!rawEntry?.areaOfEffect,
                areaColor: rawEntry?.areaColor,
                areaSize: rawEntry?.areaSize,
                areaShape: rawEntry?.areaShape,
                areaRayLength: rawEntry?.areaRayLength,
                areaRayWidth: rawEntry?.areaRayWidth
              };
          const hasArea = !!normalized.areaOfEffect;
          return {
            level,
            title: String(normalized.title ?? '').trim(),
            text: String(normalized.text ?? '').trim(),
            actionTypeLabel: getActionTypeLabel(normalized.actionType),
            resourceGain: Number(normalized.resourceGain) || 0,
            resourceLoss: Number(normalized.resourceLoss) || 0,
            hasArea,
            areaLabel: hasArea ? `Area: ${getAreaShapeLabel(normalized.areaShape)}, Size: ${Number(normalized.areaSize) || 1}` : '',
            areaColor: normalized.areaColor ?? '#6366f1',
            areaSize: Number(normalized.areaSize) || 1,
            areaShape: normalized.areaShape ?? 'rect',
            areaRayLength: Number(normalized.areaRayLength) || 1,
            areaRayWidth: Number(normalized.areaRayWidth) || 1
          };
        })
        .filter((feature) => feature.text && feature.level <= currentLevel);

      const activeRace = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'race')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .slice(0, 1)[0];
      const raceFeatureMap = activeRace?.system?.features ?? {};
      const raceFeatureUsage = context.actor.system.raceFeatureUsage ?? {};
      context.activeRace = activeRace;
      context.hasRace = !!(activeRace || context.actor.system.race);
      context.raceFeatures = [1, 5, 10, 15]
        .map((level) => {
          const rawEntry = raceFeatureMap[String(level)] ?? raceFeatureMap[level] ?? {};
          const normalized = typeof rawEntry === 'string'
            ? { title: '', text: rawEntry, uses: 0 }
            : {
                title: rawEntry?.title ?? '',
                text: rawEntry?.text ?? '',
                actionType: rawEntry?.actionType ?? 'major',
                uses: Number(rawEntry?.uses ?? rawEntry?.usesPerDay ?? rawEntry?.limit ?? 0) || 0,
                areaOfEffect: !!rawEntry?.areaOfEffect,
                areaColor: rawEntry?.areaColor,
                areaSize: rawEntry?.areaSize,
                areaShape: rawEntry?.areaShape,
                areaRayLength: rawEntry?.areaRayLength,
                areaRayWidth: rawEntry?.areaRayWidth
              };
          const usedCount = Number(raceFeatureUsage[String(level)] ?? raceFeatureUsage[level] ?? 0) || 0;
          const hasArea = !!normalized.areaOfEffect;
          return {
            level,
            title: String(normalized.title ?? '').trim(),
            text: String(normalized.text ?? '').trim(),
            actionTypeLabel: getActionTypeLabel(normalized.actionType),
            uses: Number(normalized.uses) || 0,
            usedCount,
            remainingUses: Math.max(0, (Number(normalized.uses) || 0) - usedCount),
            hasArea,
            areaLabel: hasArea ? `Area: ${getAreaShapeLabel(normalized.areaShape)}, Size: ${Number(normalized.areaSize) || 1}` : '',
            areaColor: normalized.areaColor ?? '#6366f1',
            areaSize: Number(normalized.areaSize) || 1,
            areaShape: normalized.areaShape ?? 'rect',
            areaRayLength: Number(normalized.areaRayLength) || 1,
            areaRayWidth: Number(normalized.areaRayWidth) || 1
          };
        })
        .filter((feature) => feature.text && feature.level <= currentLevel);

      context.resourceLabel = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
      context.resourceType = resourceType;
      context.resourceValue = resourceValue;
      context.resourceMax = resourceMax;
      context.resourcePercent = resourcePercent;
      context.healthValue = healthValue;
      context.healthMax = healthMax;
      context.healthPercent = healthPercent;
      context.attributeEntries = summaryAttributeOrder.map((key) => ({
        key,
        label: attributeLabels[key] ?? key,
        value: Number(attributes[key]) || 1,
        target: (Number(attributes[key]) || 1) * 10,
        checkTarget: (Number(attributes[key]) || 1) * 11,
        max: isNpc ? getLevelProgression(level).attributeMax : 9
      }));
      if (isNpc) {
        context.npcAttributeMax = getLevelProgression(level).attributeMax;
        context.npcAttributeBudget = getLevelProgression(level).attributeBudget;
        context.npcAttributeTotal = summaryAttributeOrder.reduce((sum, key) => sum + (Number(attributes[key]) || 0), 0);
      }
      const fieldsOfStudy = context.actor.system.fieldsOfStudy ?? {};
      const fieldOfStudyCount = Math.min(9, Math.max(0, Number(attributes.observation) || 0));
      context.fieldsOfStudy = Array.from({ length: fieldOfStudyCount }, (_, index) => {
        const key = String(index + 1);
        const entry = fieldsOfStudy[key] ?? {};
        return {
          key,
          name: String(entry.name ?? '').trim(),
          trained: !!entry.trained
        };
      });

      context.attributeOptions = Object.entries(attributeLabels).map(([key, label]) => ({
        key,
        label
      }));

      const skillTalentMap = {};
      const talentItems = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'talent')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)));
      const getTalentSlots = (skillKey) => {
        const skillValue = Math.min(9, Math.max(0, Number(skills[skillKey]) || 0));
        const slots = [
          { milestone: 3, maxTier: 1, label: 'Tier 1' },
          { milestone: 6, maxTier: 2, label: 'Tier 1 or 2' },
          { milestone: 9, maxTier: 3, label: 'Any Tier' }
        ].filter((slot) => skillValue >= slot.milestone)
          .map((slot) => ({ ...slot, talent: null }));
        const talents = talentItems
          .filter((item) => String(item.system?.skill ?? '').trim() === skillKey)
          .map((item) => ({
            id: item.id,
            name: item.name || 'Talent',
            description: String(item.system?.description ?? '').trim(),
            tier: Math.max(1, Number(item.system?.tier) || 1),
            usesPerDay: Number(item.system?.usesPerDay) || 0,
            actionTypeLabel: getActionTypeLabel(item.system?.actionType),
            slot: Number(item.system?.talentSlot) || 0
          }));

        for (const talent of talents) {
          const assignedSlot = slots.find((slot) => slot.milestone === talent.slot && !slot.talent && talent.tier <= slot.maxTier)
            ?? slots.find((slot) => !slot.talent && talent.tier <= slot.maxTier);
          if (assignedSlot) assignedSlot.talent = talent;
        }
        return slots;
      };

      for (const group of skillGroups) {
        group.keys.forEach((key) => {
          const entries = talentItems
            .filter((item) => String(item.system?.skill ?? '').trim() === key)
            .slice(0, 3)
            .map((item) => ({
              id: item.id,
              name: item.name || 'Talent',
              description: String(item.system?.description ?? '').trim(),
              tier: Number(item.system?.tier) || 1,
              usesPerDay: Number(item.system?.usesPerDay) || 0,
              actionTypeLabel: getActionTypeLabel(item.system?.actionType)
            }));
          skillTalentMap[key] = entries;
        });
      }

      const favoriteSkillKeys = Array.isArray(actorFlagState.favoriteSkills) ? actorFlagState.favoriteSkills : [];
      context.skillGroups = skillGroups.map(group => ({
        label: group.label,
        entries: group.keys
          .map(key => ({
            key,
            label: skillLabels[key] ?? key,
            value: Math.min(9, Math.max(0, Number(skills[key]) || 0)),
            talents: Array.isArray(skillTalentMap[key]) ? skillTalentMap[key] : [],
            talentSlots: getTalentSlots(key),
            favorite: favoriteSkillKeys.includes(key)
          }))
          .sort((a, b) => group.label === 'General' ? a.label.localeCompare(b.label) : 0)
      }));
      context.favoriteSkillEntries = context.skillGroups
        .flatMap((group) => group.entries)
        .filter((skill) => skill.favorite);
      context.skillTalentMap = skillTalentMap;

      const weaponItems = [...(context.actor.items ?? [])]
        .filter((item) => isWeaponItem(item) && item.system?.equipped !== false)
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          name: item.name,
          damage: String(item.system?.damageDice ?? item.system?.damage ?? '1d6').trim() || '1d6',
          range: String(item.system?.range ?? '1').trim() || '1',
          breakPoints: Number(item.system?.breakPoints ?? 0) || 0,
          skill: String(item.system?.skill ?? 'light_weapons').trim() || 'light_weapons',
          skillLabel: skillLabels[String(item.system?.skill ?? 'light_weapons').trim()] ?? 'Weapon',
          skillValue: Math.min(9, Math.max(0, Number(skills[String(item.system?.skill ?? 'light_weapons').trim()]) || 0))
        }));
      context.weaponItems = weaponItems;

      const getEquippedGearByCategory = (category) => [...(context.actor.items ?? [])]
        .filter((item) => (item.type === 'gear' && String(item.system?.category ?? '').trim() === category || item.type === 'armor' && item.system?.armorType === category) && item.system?.equipped !== false)
        .map((item) => ({
          id: item.id,
          name: item.name || category,
          defense: Number(item.system?.defense ?? 0) || 0,
          breakPoints: Number(item.system?.breakPoints ?? 0) || 0
        }));
      context.armorItems = getEquippedGearByCategory('armor');
      context.shieldItems = getEquippedGearByCategory('shield');
      context.armorItems = context.armorItems.slice(0, 1);
      context.shieldItems = context.shieldItems.slice(0, 1);
      context.shieldItems.forEach((shield) => {
        shield.isBlocking = shield.id === context.actor.flags?.['d100-system']?.activeShieldId;
      });

      const gearItems = [...(context.actor.items ?? [])]
        .filter((item) => ['gear', 'armor', 'weapon'].includes(item.type))
        .map((item) => ({
          id: item.id,
          documentType: item.type,
          name: item.name || (item.type === 'armor' ? 'Armor' : item.type === 'weapon' ? 'Weapon' : 'Gear'),
          category: item.type === 'weapon'
            ? 'weapon'
            : item.type === 'armor'
            ? String(item.system?.armorType ?? 'armor').trim() || 'armor'
            : String(item.system?.category ?? 'misc').trim() || 'misc',
          quantity: Math.max(0, Number(item.system?.quantity) || 0),
          tier: Math.max(0, Number(item.system?.tier) || 0),
          actionTypeLabel: item.type === 'gear' ? getActionTypeLabel(item.system?.actionType) : '',
          ammunition: !!item.system?.ammunition,
          equipped: item.system?.equipped !== false
        }));
      context.equippedGearItems = gearItems.filter((item) => item.equipped && item.category !== 'consumable');
        context.equippedWeapons = context.equippedGearItems.filter((item) => item.category === 'weapon').slice(0, 3);
      context.equippedShields = context.equippedGearItems.filter((item) => item.category === 'shield').slice(0, 1);
      context.equippedArmor = context.equippedGearItems.filter((item) => item.category === 'armor').slice(0, 1);
      context.equippedMagicItems = context.equippedGearItems.filter((item) => item.category === 'magic_item');
      context.unequippedGearItems = gearItems.filter((item) => !item.equipped && item.category !== 'consumable');
      context.unequippedWeapons = context.unequippedGearItems.filter((item) => item.category === 'weapon');
      context.unequippedArmor = context.unequippedGearItems.filter((item) => item.category === 'armor');
      context.unequippedShields = context.unequippedGearItems.filter((item) => item.category === 'shield');
      context.unequippedMagicItems = context.unequippedGearItems.filter((item) => item.category === 'magic_item');
      context.activeUnequippedItemTab = this._activeUnequippedItemTab ?? 'weapon';
      context.ammunitionGearItems = gearItems.filter((item) => item.category === 'consumable' && item.ammunition);
      context.consumableGearItems = gearItems.filter((item) => item.category === 'consumable' && !item.ammunition);
      context.activeConsumableItemTab = this._activeConsumableItemTab ?? 'ammunition';
      context.miscGearItems = gearItems.filter((item) => item.category === 'misc' || item.category === 'tool');

      const magicSkillKeys = ['cosmic_magic', 'druidic_magic', 'elemental_magic', 'light_magic', 'shadow_magic'];
      const magicTabLabels = {
        cosmic_magic: 'Cosmic',
        druidic_magic: 'Druidic',
        elemental_magic: 'Elemental',
        light_magic: 'Light',
        shadow_magic: 'Shadow'
      };
      const spellItems = [...(context.actor.items ?? [])].filter((item) => {
        const isLegacyMagicItem = item.type === 'gear' && String(item.system?.category ?? '').trim() === 'magic_item';
        return isLegacyMagicItem || item.type === 'spell';
      });
      const mapSpellEntry = (item, fallbackSkill = '') => {
        const damageHealing = String(item.system?.damageHealing ?? '').trim();
        const damageType = String(item.system?.damageType ?? 'healing').trim() || 'healing';
        const effectLabel = damageType === 'healing' ? 'Healing' : `${damageType.charAt(0).toUpperCase() + damageType.slice(1)} Damage`;
        const magicSkillCheck = String(item.system?.magicSkill ?? item.system?.skill ?? fallbackSkill).trim();
        return {
          id: item.id,
          name: item.name || 'Spell',
          description: String(item.system?.description ?? '').trim(),
          range: String(item.system?.range ?? '').trim(),
          breakPoints: Number(item.system?.breakPoints ?? 0) || 0,
          tier: Number(item.system?.tier ?? 0) || 0,
          damageHealing,
          damageHealingLabel: damageHealing ? `${damageHealing} ${effectLabel}` : '',
          empowermentDice: String(item.system?.empowermentDice ?? '').trim(),
          resourceCost: Number(item.system?.resourceCost ?? 0) || 0,
          empowermentCost: Number(item.system?.empowermentCost ?? 0) || 0,
          actionTypeLabel: getActionTypeLabel(item.system?.actionType),
          magicSkillCheck,
          magicSkillLabel: skillLabels[magicSkillCheck] ?? 'Magic'
        };
      };
      const spellTabs = isNpc
        ? [{ key: 'npc-spells', label: 'Spells', maxTier: null, entries: spellItems.map((item) => mapSpellEntry(item)) }]
        : magicSkillKeys
          .filter((skillKey) => (Number(skills[skillKey]) || 0) > 0)
          .map((skillKey) => {
            const maxTier = getMaxSpellTier(skills[skillKey]);
            const entries = spellItems.filter((item) => {
            const itemSkill = String(item.system?.magicSkill ?? item.system?.skill ?? item.system?.magicSkillCheck ?? '').trim();
            const itemTier = Math.max(0, Number(item.system?.tier) || 0);
            return itemSkill === skillKey && itemTier <= maxTier;
            }).map((item) => mapSpellEntry(item, skillKey));
            return {
              key: skillKey,
              label: magicTabLabels[skillKey] ?? skillLabels[skillKey] ?? skillKey,
              maxTier,
              entries
            };
          });

      const activeMagicSkill = this._activeMagicSkillTab
        ?? spellTabs.find((tab) => tab.entries.length)?.key
        ?? spellTabs[0]?.key
        ?? 'cosmic_magic';

      context.spellTabs = spellTabs;
      context.activeMagicSkill = activeMagicSkill;

      return context;
    }

    _rememberFeatureOpen(event, group) {
      if (!this._openFeatureLevels) {
        this._openFeatureLevels = { profession: [], race: [] };
      }
      const level = Number(event.currentTarget.dataset.featureLevel) || 0;
      if (!level) return;
      const key = group === 'race' ? 'race' : 'profession';
      const existing = this._openFeatureLevels[key] ?? [];
      if (!existing.includes(level)) {
        this._openFeatureLevels[key] = [...existing, level];
      }
    }

    _restoreFeatureOpenState(html) {
      const openByGroup = this._openFeatureLevels ?? { profession: [], race: [] };
      html.find('details[data-feature-level]').each((_, element) => {
        const level = Number(element.dataset.featureLevel) || 0;
        const isRace = element.closest('.race-features-block') !== null;
        const group = isRace ? 'race' : 'profession';
        element.open = (openByGroup[group] ?? []).includes(level);
      });
    }

    _rememberOpenSkillTalentSections(html) {
      this._openSkillTalentSections = html.find('.skill-talent-collapsible').toArray()
        .filter((element) => element.open)
        .map((element) => element.dataset.skill)
        .filter(Boolean);
    }

    _restoreOpenSkillTalentSections(html) {
      const openSkills = this._openSkillTalentSections ?? [];
      html.find('.skill-talent-collapsible').each((_, element) => {
        element.open = openSkills.includes(element.dataset.skill);
      });
    }

    activateListeners(html) {
      super.activateListeners(html);
      const ownerColor = getActorOwnerColor(this.actor);
      const sheetElement = this.element?.[0];
      sheetElement?.style.setProperty('--d100-sheet-border-color', ownerColor);
      sheetElement?.closest?.('.app')?.style.setProperty('--d100-sheet-border-color', ownerColor);
      this._restoreFeatureOpenState(html);
      this._restoreOpenSkillTalentSections(html);
      const syncInactiveTabInputs = () => {
        html.find('.tab[data-group="primary"]').each((_, tab) => {
          const isActive = tab.classList.contains('active');
          tab.querySelectorAll('input[name], select[name], textarea[name]').forEach((input) => {
            const requiresEditMode = input.name.startsWith('system.languagesKnown.');
            input.disabled = !isActive || (requiresEditMode && !this._editMode);
          });
        });
      };
      syncInactiveTabInputs();
      html.find('.save-roll').click(this._onSaveRoll.bind(this));
      html.find('.attribute-check-roll').click(this._onAttributeCheckRoll.bind(this));
      html.find('.skill-display-roll').click(this._onSkillRoll.bind(this));
      html.find('.rest-button').click(this._onRest.bind(this));
      html.find('.skill-favorite-toggle').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const skillKey = event.currentTarget.dataset.skill;
        if (!skillKey) return;
        const favorites = Array.isArray(this.actor.flags?.['d100-system']?.favoriteSkills)
          ? [...this.actor.flags['d100-system'].favoriteSkills]
          : [];
        const nextFavorites = favorites.includes(skillKey)
          ? favorites.filter((key) => key !== skillKey)
          : [...favorites, skillKey];
        await this.actor.setFlag('d100-system', 'favoriteSkills', nextFavorites);
        this.render();
      });
      html.find('.skill-display-roll').on('dragstart', (event) => {
        const button = event.currentTarget;
        const dragData = {
          type: 'd100SkillRoll',
          actorId: this.actor.id,
          skillKey: button.dataset.skill,
          skillLabel: button.dataset.skillLabel || skillLabels[button.dataset.skill] || button.dataset.skill
        };
        event.originalEvent?.dataTransfer?.setData('text/plain', JSON.stringify(dragData));
        event.originalEvent?.dataTransfer?.setData('application/json', JSON.stringify(dragData));
      });
      html.find('.profession-item-button').click((event) => {
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) {
          item.sheet?.render(true);
        }
      });
      html.find('.item-list-entry').click((event) => {
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (item) item.sheet?.render(true);
      });
      html.find('.item-list-entry').each((_, entry) => {
        if (entry.parentElement.classList.contains('item-list-entry-wrapper')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'item-list-entry-wrapper';
        entry.parentElement.insertBefore(wrapper, entry);
        wrapper.appendChild(entry);
        const item = this.actor.items.get(entry.dataset.itemId);
        const isGear = ['gear', 'armor', 'weapon'].includes(item?.type);
        const equipped = item?.system?.equipped !== false;
        const isConsumable = isGear && item.system?.category === 'consumable';
        const isMagicItem = isGear && item.system?.category === 'magic_item';
        const isMisc = isGear && ['misc', 'tool'].includes(item.system?.category);
        wrapper.insertAdjacentHTML('beforeend', `
          ${isGear && !isConsumable ? `<button type="button" class="item-list-equip" data-item-id="${item.id}" data-equipped="${equipped}" title="${equipped ? 'Unequip item' : 'Equip item'}" aria-label="${equipped ? 'Unequip' : 'Equip'} ${item.name}"><i class="fas fa-${equipped ? 'toggle-on' : 'toggle-off'}"></i></button>` : ''}
          ${isConsumable ? `<input type="number" class="item-quantity" data-item-id="${item.id}" value="${Math.max(0, Number(item.system?.quantity) || 0)}" min="0" aria-label="${item.name} quantity" /><button type="button" class="item-list-use" data-item-id="${item.id}" title="Use item" aria-label="Use ${item.name}">Use</button>` : ''}
          ${isMagicItem ? `<button type="button" class="item-list-magic-use" data-item-id="${item.id}" title="Use magic item" aria-label="Use ${item.name}">Use</button>` : ''}
          ${isMisc ? `<button type="button" class="item-list-description" data-item-id="${item.id}" title="Send description to chat" aria-label="Send ${item.name} description to chat"><i class="fas fa-comment"></i></button>` : ''}
          <button type="button" class="item-list-remove" data-item-id="${entry.dataset.itemId}" title="Remove item" aria-label="Remove ${entry.textContent.trim()}"><i class="fas fa-trash"></i></button>
        `);
      });
      html.find('.item-quantity').change(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;
        const quantity = Math.max(0, Number(event.currentTarget.value) || 0);
        if (quantity === 0) await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
        else await item.update({ 'system.quantity': quantity });
        this.render();
      });
      html.find('.item-list-use').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;

        const quantity = Math.max(0, Number(item.system?.quantity) || 0);
        if (quantity <= 0) return;
        const dice = String(item.system?.consumableDice ?? '').trim();
        const effect = item.system?.consumableEffect === 'healing' ? 'Healing' : 'Damage';
        const damageType = String(item.system?.damageType ?? '').trim();
        const description = String(item.system?.description ?? '').trim();
        let rollSummary = '';
        const messageRolls = [];
        if (dice) {
          const roll = await new Roll(parseDiceExpression(dice)).evaluate();
          messageRolls.push(roll);
          const label = effect === 'Healing' ? 'Healing' : `${damageType.charAt(0).toUpperCase() + damageType.slice(1)} Damage`;
          rollSummary = `<p><strong>${label}:</strong> ${roll.total} (${parseDiceExpression(dice)})</p>${buildApplyEffectButton(roll.total, effect === 'Healing' ? 'healing' : damageType)}`;
        }
        const areaButton = item.system?.areaOfEffect
          ? `<p>${areaTemplateButton(item.system?.areaColor, item.system?.areaSize, item.system?.areaShape, true, item.system?.areaRayLength, item.system?.areaRayWidth)}</p>`
          : '';
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<p><strong>${this.actor.name}</strong> uses <strong>${item.name}</strong>.</p>${rollSummary}${description ? `<p>${renderChatText(description, this.actor)}</p>` : ''}${areaButton}${itemEffectsChatContent(item, this.actor)}`,
          rolls: messageRolls
        });

        if (quantity === 1) await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
        else await item.update({ 'system.quantity': quantity - 1 });
        this.render();
      });
      html.find('.item-list-magic-use').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;

        const effect = item.system?.magicItemEffect ?? 'none';
        const dice = String(item.system?.magicItemDice ?? '').trim();
        const damageType = String(item.system?.damageType ?? '').trim();
        const description = String(item.system?.description ?? '').trim();
        const resourceCost = Math.max(0, Number(item.system?.resourceCost) || 0);
        const currentResource = Math.max(0, Number(this.actor.system.resource?.value) || 0);
        const resourceType = String(this.actor.system.resource?.type ?? 'resource').replace(/^./, (character) => character.toUpperCase());
        if (currentResource < resourceCost) {
          ui.notifications.warn(`Not enough ${resourceType} to use ${item.name}.`);
          return;
        }
        const nextResource = Math.max(0, currentResource - resourceCost);
        let rollSummary = '';
        const messageRolls = [];
        if (effect !== 'none' && dice) {
          const roll = await new Roll(parseDiceExpression(dice)).evaluate();
          messageRolls.push(roll);
          const label = effect === 'healing' ? 'Healing' : `${damageType.charAt(0).toUpperCase() + damageType.slice(1)} Damage`;
          rollSummary = `<p><strong>${label}:</strong> ${roll.total} (${parseDiceExpression(dice)})</p>${buildApplyEffectButton(roll.total, effect === 'healing' ? 'healing' : damageType)}`;
        }
        if (resourceCost > 0) await this.actor.update({ 'system.resource.value': nextResource });
        const areaButton = item.system?.areaOfEffect
          ? `<p>${areaTemplateButton(item.system?.areaColor, item.system?.areaSize, item.system?.areaShape, true, item.system?.areaRayLength, item.system?.areaRayWidth)}</p>`
          : '';
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<p><strong>${this.actor.name}</strong> uses <strong>${item.name}</strong>.</p>${resourceCost > 0 ? `<p><strong>${resourceType} spent:</strong> ${resourceCost} (${currentResource} → ${nextResource})</p>` : ''}${rollSummary}${description ? `<p>${renderChatText(description, this.actor)}</p>` : ''}${areaButton}${itemEffectsChatContent(item, this.actor)}`,
          rolls: messageRolls
        });
        this.render();
      });
      html.find('.item-list-description').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;
        const description = String(item.system?.description ?? '').trim();
        const tier = Math.max(0, Number(item.system?.tier) || 0);
        const gold = Math.max(0, Number(item.system?.gold) || 0);
        const silver = Math.max(0, Number(item.system?.silver) || 0);
        const copper = Math.max(0, Number(item.system?.copper) || 0);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <h3>${item.name}</h3>
            <p>Tier: ${tier}</p>
            <p>Cost: ${gold} Gold, ${silver} Silver, ${copper} Copper</p>
            ${description ? `<p>${renderChatText(description, this.actor)}</p>` : '<p>No description supplied.</p>'}
          `
        });
      });
      html.find('.item-list-equip').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item || !['gear', 'armor', 'weapon'].includes(item.type)) return;

        const shouldEquip = event.currentTarget.dataset.equipped !== 'true';
        await item.update({ 'system.equipped': shouldEquip });
        if (!shouldEquip && this.actor.flags?.['d100-system']?.activeShieldId === item.id) {
          await this.actor.unsetFlag('d100-system', 'activeShieldId');
        }
        this.render();
      });
      html.find('.item-list-remove').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;
        await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
        this.render();
      });
      html.find('.unequipped-item-tab').click((event) => {
        const category = event.currentTarget.dataset.category;
        this._activeUnequippedItemTab = category;
        html.find('.unequipped-item-tab').each((_, button) => {
          button.classList.toggle('active', button.dataset.category === category);
        });
        html.find('.unequipped-item-panel').each((_, panel) => {
          panel.classList.toggle('active', panel.dataset.categoryPanel === category);
        });
      });
      html.find('.consumable-item-tab').click((event) => {
        const category = event.currentTarget.dataset.consumableCategory;
        this._activeConsumableItemTab = category;
        html.find('.consumable-item-tab').each((_, button) => {
          button.classList.toggle('active', button.dataset.consumableCategory === category);
        });
        html.find('.consumable-item-panel').each((_, panel) => {
          panel.classList.toggle('active', panel.dataset.consumableCategoryPanel === category);
        });
      });
      html.find('[data-edit-toggle]').change((event) => {
        this._editMode = event.currentTarget.checked;
        this.render();
      });
      html.find('.sheet-tabs .item').click(() => {
        setTimeout(syncInactiveTabInputs, 0);
      });
      html.find('.vital-field').change(async (event) => {
        const path = event.currentTarget.dataset.vitalPath;
        if (!path) return;

        let value = Number(event.currentTarget.value);
        if (!Number.isFinite(value)) value = 0;

        if (path === 'system.health.value') {
          value = Math.max(0, Math.min(value, Number(this.actor.system.health?.max) || 0));
        } else if (path === 'system.resource.value') {
          value = Math.max(0, Math.min(value, Number(this.actor.system.resource?.max) || 0));
        }

        await this.actor.update({ [path]: value });
        this.render();
      });
      html.find('.reaction-toggle').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const combatantId = event.currentTarget.dataset.combatantId;
        const combatant = game.combat?.combatants.get(combatantId);
        if (!combatant) return;
        const current = !!combatant.flags?.['d100-system']?.reactionUsed;
        await combatant.update({ 'flags.d100-system.reactionUsed': !current });
        this.render();
      });
      html.find('.skill-talent-send').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.talentId;
        const item = this.actor.items.get(itemId);
        if (!item) return;
        const description = String(item.system?.description ?? '').trim();
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> uses talent <strong>${item.name}</strong>.</p>
            ${description ? `<p>${renderChatText(description, this.actor)}</p>` : ''}
            ${configuredAreaButton(item.system)}
            ${itemEffectsChatContent(item, this.actor)}
          `
        });
      });
      html.find('.skill-talent-row').on('contextmenu', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.talentId;
        const item = this.actor.items.get(itemId);
        if (!item || item.type !== 'talent') return;

        this._rememberOpenSkillTalentSections(html);
        await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
      html.on('click', '[data-d100-area-template]', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await placeAreaTemplate({
          color: event.currentTarget.dataset.areaColor,
          size: event.currentTarget.dataset.areaSize,
          rayLength: event.currentTarget.dataset.areaRayLength,
          rayWidth: event.currentTarget.dataset.areaRayWidth,
          shape: event.currentTarget.dataset.areaConfigured === 'true' ? event.currentTarget.dataset.areaShape : ''
        });
      });
        this.render();
      });
      html.find('.skill-talent-slot').on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      }).on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      }).on('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const slot = event.currentTarget;
        const skillKey = slot.dataset.skill;
        const milestone = Number(slot.dataset.milestone) || 0;
        const maxTier = Number(slot.dataset.maxTier) || 0;
        const data = getDragItemData(event);
        if (!data || !skillKey || !milestone) return;

        let item = typeof Item.fromDropData === 'function' ? await Item.fromDropData(data) : null;
        if (!item && data.uuid) item = await fromUuid(data.uuid);
        if (!item || item.type !== 'talent') return;

        const talentTier = Math.max(1, Number(item.system?.tier) || 1);
        if (talentTier > maxTier) {
          ui.notifications.warn(`The Skill ${milestone} Talent slot accepts only Tiers 1-${maxTier}.`);
          return;
        }

        const existingTalents = [...this.actor.items].filter((actorItem) => actorItem.type === 'talent'
          && String(actorItem.system?.skill ?? '').trim() === skillKey
          && actorItem.id !== item.id);
        const unlockedSlots = [3, 6, 9].filter((value) => (Number(this.actor.system.skills?.[skillKey]) || 0) >= value);
        if (existingTalents.some((actorItem) => Number(actorItem.system?.talentSlot) === milestone)) {
          ui.notifications.warn(`The Skill ${milestone} Talent slot is already occupied.`);
          return;
        }
        if (existingTalents.length >= unlockedSlots.length) {
          ui.notifications.warn(`${skillLabels[skillKey] ?? 'This skill'} has no open Talent slots.`);
          return;
        }

        if (!item.parent || item.parent !== this.actor) {
          const created = await this.actor.createEmbeddedDocuments('Item', [item.toObject()]);
          item = created[0];
        }
        await item.update({ 'system.skill': skillKey, 'system.talentSlot': milestone });
        this.render();
      });
      html.find('.weapon-display-row').click((event) => {
        const target = event.target;
        if (target.closest('button')) return;
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) {
          item.sheet?.render(true);
        }
      });

      html.find('.magic-skill-tab').click((event) => {
        const skillKey = event.currentTarget.dataset.skill;
        this._activeMagicSkillTab = skillKey;

        html.find('.magic-skill-tab').each((_, element) => {
          element.classList.toggle('active', element.dataset.skill === skillKey);
        });
        html.find('.magic-skill-panel').each((_, element) => {
          element.classList.toggle('active', element.dataset.skillPanel === skillKey);
        });
      });
      html.find('.spell-table-row').click((event) => {
        if (event.target.closest('button')) return;
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (item) item.sheet?.render(true);
      }).on('contextmenu', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this._editMode) return;
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;
        if (item.type === 'spell') {
          await item.update({ 'system.magicSkill': '' });
        } else {
          await item.update({ 'system.category': 'misc', 'system.skill': '' });
        }
        this.render();
      });

      html.find('.npc-action-row').click((event) => {
        if (event.target.closest('button')) return;
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (item) item.sheet?.render(true);
      }).on('contextmenu', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this._editMode) return;
        const itemId = event.currentTarget.dataset.itemId;
        if (itemId) await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        this.render();
      });
      html.find('.npc-action-use').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          const item = this.actor.items.get(event.currentTarget.dataset.itemId);
          if (!item) return;

          let skillCheck = null;
          if (item.system?.requiresCheck) {
            const allowedAttributes = ['strength', 'toughness', 'observation', 'reflex', 'majesty'];
            const attributeOptions = allowedAttributes
              .map((value) => `<option value="${value}">${attributeLabels[value] ?? value}</option>`)
              .join('');

            const chosen = await new Promise((resolve) => {
              new Dialog({
                title: `Attribute Check: ${item.name}`,
                content: `
                  <div class="d100-system">
                    <form>
                      <div class="form-group">
                        <label>Attribute</label>
                        <select name="attribute">${attributeOptions}</select>
                      </div>
                      <div class="form-group">
                        <label>Songs</label>
                        <input type="number" name="songs" value="0" min="0" />
                      </div>
                      <div class="form-group">
                        <label>Swords</label>
                        <input type="number" name="swords" value="0" min="0" />
                      </div>
                    </form>
                  </div>
                `,
                buttons: {
                  roll: {
                    label: 'Roll d100',
                    callback: (dialogHtml) => {
                      const root = dialogHtml?.[0] ?? dialogHtml;
                      const form = root?.querySelector ? root.querySelector('form') : root;
                      const formData = new foundry.applications.ux.FormDataExtended(form);
                      resolve(formData.object);
                    }
                  }
                },
                default: 'roll',
                close: () => resolve(null)
              }, { classes: ['dialog', 'd100-system'] }).render(true);
            });

            if (!chosen) return;

            const attributeKey = chosen.attribute ?? allowedAttributes[0];
            const attributeLabel = attributeLabels[attributeKey] ?? attributeKey;
            const songs = Math.max(0, Number(chosen.songs) || 0);
            const swords = Math.max(0, Number(chosen.swords) || 0);
            const attributeValue = Number(this.actor.system.attributes[attributeKey]) || 0;
            const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + attributeValue + songs - swords));
            const roll = await new Roll('1d100').evaluate();
            const degreeInfo = getDegreeInfo(roll.total, targetNumber);

            skillCheck = {
              attributeLabel,
              attributeValue,
              songs,
              swords,
              targetNumber,
              roll,
              degreeInfo
            };
          }

          const executed = await executeNpcAction(this.actor, item, { skillCheck });
          if (!executed) ui.notifications.warn(`${item.name} could not be used (it may still be recharging).`);
          this.render();
        } catch (error) {
          console.error('D100 System | NPC Action roll failed', error);
          ui.notifications.error('Something went wrong rolling that NPC Action. See console (F12) for details.');
        }
      });
      html.find('.npc-feature-chat').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;
        const description = String(item.system?.description ?? '').trim();
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<p><strong>${item.name}</strong></p>${description ? `<p>${renderChatText(description, this.actor)}</p>` : '<p>No description supplied.</p>'}${configuredAreaButton(item.system)}${itemEffectsChatContent(item, this.actor)}`
        });
      });
      html.find('.npc-feature-open').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        item?.sheet?.render(true);
      });
      html.find('.category-trait-entry-open').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        const uuid = event.currentTarget.dataset.entryUuid;
        if (!uuid) return;
        fromUuid(uuid).then((traitItem) => traitItem?.sheet?.render(true));
      });
      html.find('.category-trait-chat').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const uuid = event.currentTarget.dataset.entryUuid;
        if (!uuid) return;
        const choices = this.actor.system.categoryTraitChoices ?? {};
        const choice = Object.values(choices).find((entry) => entry?.uuid === uuid);
        if (!choice) return;
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<p><strong>${choice.name}</strong></p>${choice.description ? `<p>${renderChatText(choice.description, this.actor)}</p>` : '<p>No description supplied.</p>'}`
        });
      });
      html.find('.category-trait-choice-row').on('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        ui.notifications.info('Category Traits are chosen automatically based on level. Edit the Category item to change what it offers.');
      });
      html.find('.npc-category-traits-block').on('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
      }).on('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        ui.notifications.info('Category Traits are chosen automatically. Drag Trait items onto the Category item itself instead.');
      });
      html.find('.weapon-technique-start').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const select = event.currentTarget.closest('.weapon-technique-select-row')?.querySelector('.weapon-technique-select');
        const itemId = select?.value;
        if (!itemId) return;
        const item = this.actor.items.get(itemId);
        if (!item) return;
        const cost = Math.max(0, Math.floor(Number(item.system?.resourceCostToBegin) || 0));
        const resource = this.actor.system.resource ?? {};
        const currentResource = Number(resource.value) || 0;
        if (cost > currentResource) {
          ui.notifications.warn(`Not enough Resource to begin ${item.name} (needs ${cost}, has ${currentResource}).`);
          return;
        }
        const updates = { 'system.activeWeaponTechnique': { itemId, stage: 1, chosenOptions: {} } };
        if (cost > 0) updates['system.resource.value'] = currentResource - cost;
        await this.actor.update(updates);
        await applyConditionToActor(this.actor, 'concentration', 1);
        this.render();
      });
      html.find('.weapon-technique-choose-option').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const stageKey = event.currentTarget.dataset.stageKey;
        const optionKey = event.currentTarget.dataset.optionKey;
        if (!stageKey || !optionKey) return;
        await this.actor.update({ [`system.activeWeaponTechnique.chosenOptions.${stageKey}`]: optionKey });
        this.render();
      });
      html.find('.weapon-technique-advance').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const state = this.actor.system.activeWeaponTechnique ?? {};
        const item = state.itemId ? this.actor.items.get(state.itemId) : null;
        if (!item) return;
        const currentStage = Math.min(3, Math.max(1, Number(state.stage) || 1));
        if (currentStage >= 3) return;
        const stageData = item.system?.stages?.[String(currentStage)] ?? {};
        const cost = Math.max(0, Math.floor(Number(stageData.resourceCostToAdvance) || 0));
        const resource = this.actor.system.resource ?? {};
        const currentResource = Number(resource.value) || 0;
        if (cost > currentResource) {
          ui.notifications.warn(`Not enough Resource to advance (needs ${cost}, has ${currentResource}).`);
          return;
        }
        const updates = {
          'system.activeWeaponTechnique.stage': currentStage + 1
        };
        if (cost > 0) updates['system.resource.value'] = currentResource - cost;
        await this.actor.update(updates);
        this.render();
      });
      html.find('.weapon-technique-stop').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await this.actor.update({ 'system.activeWeaponTechnique': { itemId: '', stage: 1, chosenOptions: {} } });
        await removeConditionStacks(this.actor, 'concentration', null);
        this.render();
      });
      html.find('.weapon-technique-send-chat').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const stageKey = event.currentTarget.dataset.stageKey;
        if (!stageKey) return;
        const state = this.actor.system.activeWeaponTechnique ?? {};
        const item = state.itemId ? this.actor.items.get(state.itemId) : null;
        if (!item) return;
        const stageData = item.system?.stages?.[stageKey] ?? {};
        const optionKey = String((state.chosenOptions ?? {})[stageKey] ?? '');
        const option = stageData.options?.[optionKey];
        if (!option) return;
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<p><strong>${item.name}</strong> — ${stageData.name || `Stage ${stageKey}`}: <strong>${option.name || `Option ${optionKey}`}</strong></p><p>${renderChatText(option.description, this.actor)}</p>`
        });
      });
      html.find('.npc-feature-item-row').on('contextmenu', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this._editMode) return;
        const itemId = event.currentTarget.dataset.itemId;
        if (itemId) await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        this.render();
      });

      html.find('.spell-magic-roll').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const itemId = event.currentTarget.dataset.itemId;
        const skillKey = event.currentTarget.dataset.skill || 'cosmic_magic';
        const item = this.actor.items.get(itemId);
        if (!item) return;

        if (getActorActiveConditions(this.actor).some((entry) => entry.def.blocksSpellcasting)) {
          ui.notifications.warn(`${this.actor.name} cannot cast Spells while Vexed.`);
          return;
        }

        const resourceCost = Number(item.system?.resourceCost ?? 0) || 0;
        const empowermentCost = Number(item.system?.empowermentCost ?? 0) || 0;
        const empowermentDice = String(item.system?.empowermentDice ?? '').trim();
        const currentResource = Number(this.actor.system.resource?.value ?? 0) || 0;
        const resourceType = String(this.actor.system.resource?.type ?? 'resource').replace(/^./, (character) => character.toUpperCase());
        const skillLabel = skillLabels[skillKey] ?? skillKey;

        const chosen = await new Promise((resolve) => {
          new Dialog({
            title: `${item.name}: ${skillLabel} Check`,
            content: `
              <div class="d100-system">
                <form>
                  <div class="form-group">
                    <label>Attribute</label>
                    <select name="attribute">
                      <option value="observation">Observation</option>
                      <option value="majesty">Majesty</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Empowerment Uses</label>
                    <input type="number" name="empowermentUses" value="0" min="0" />
                  </div>
                  <div class="form-group">
                    <label>Songs</label>
                    <input type="number" name="songs" value="0" min="0" />
                  </div>
                  <div class="form-group">
                    <label>Swords</label>
                    <input type="number" name="swords" value="0" min="0" />
                  </div>
                </form>
              </div>
            `,
            buttons: {
              roll: {
                label: 'Roll d100',
                callback: (html) => {
                  const form = html[0].querySelector('form');
                  const formData = new foundry.applications.ux.FormDataExtended(form);
                  resolve(formData.object);
                }
              }
            },
            default: 'roll',
            close: () => resolve(null)
          }, { classes: ['dialog', 'd100-system'] }).render(true);
        });

        if (!chosen) return;

        const attributeKey = chosen.attribute ?? 'observation';
        const empowermentUses = Math.max(0, Number(chosen.empowermentUses) || 0);
  const songs = Math.max(0, Number(chosen.songs) || 0);
  const swords = Math.max(0, Number(chosen.swords) || 0);
        const totalCost = resourceCost + (empowermentUses * empowermentCost);
        const nextResource = Math.max(0, currentResource - totalCost);

        if (currentResource < totalCost) {
          ui.notifications.warn(`Not enough ${resourceType} to cast ${item.name}.`);
          return;
        }

        const attributeValue = Number(this.actor.system.attributes[attributeKey]) || 0;
        const skillValue = Number(this.actor.system.skills[skillKey]) || 0;
        const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + skillValue + songs - swords));
        const roll = await new Roll('1d100').evaluate();
        const degreeInfo = getDegreeInfo(roll.total, targetNumber);

        await this.actor.update({ 'system.resource.value': nextResource });

        if (item.system?.concentration) {
          await applyConditionToActor(this.actor, 'concentration', 1);
        }

        const description = String(item.system?.description ?? '').trim();
        const empowermentDescription = String(item.system?.empowermentDescription ?? '').trim();
        const magicSkillValue = Number(this.actor.system.skills[skillKey]) || 0;
        const damageHealingExpression = buildEmpoweredDiceExpression(item.system?.damageHealing ?? '', empowermentDice, empowermentUses, magicSkillValue);
        const empowered = empowermentUses > 0;

        let damageRollSummary = '';
        const messageRolls = [roll];
        if (damageHealingExpression) {
          const spellDamageType = String(item.system?.damageType ?? 'healing').trim() || 'healing';
          const spellEffectLabel = spellDamageType === 'healing' ? 'Healing' : `${spellDamageType.charAt(0).toUpperCase() + spellDamageType.slice(1)} Damage`;
          const damageRoll = await new Roll(damageHealingExpression).evaluate();
          messageRolls.push(damageRoll);
          const trackInfo = (spellDamageType === 'healing' && item.system?.trackHealing)
            ? { healer: this.actor.name, source: item.name }
            : null;
          damageRollSummary = `
            <p><strong>${spellEffectLabel} Roll:</strong> ${damageRoll.total} (${damageHealingExpression})</p>
            ${buildApplyEffectButton(damageRoll.total, spellDamageType, trackInfo)}
          `;
        }

        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> casts <strong>${item.name}</strong> using <strong>${skillLabel}</strong>.</p>
            <p>Attribute: ${attributeLabels[attributeKey] ?? attributeKey}</p>
            <p>TN: ${targetNumber} (${attributeValue}×10 + ${skillValue} + ${songs} Songs - ${swords} Swords)</p>
            <p>Roll: ${roll.total}</p>
            <p><strong>${degreeInfo.label}</strong></p>
            <p><strong>${resourceType} spent:</strong> ${totalCost} (${resourceCost} base + ${empowermentUses * empowermentCost} empowerment; ${currentResource} → ${nextResource})</p>
            ${empowered && empowermentDice ? `<p><strong>Empowerment Dice Added:</strong> ${empowermentDice} × ${empowermentUses}</p>` : ''}
            ${damageRollSummary}
            ${skillTalentsChatContent(this.actor, skillKey)}
            ${description ? `<p><strong>Spell:</strong> ${renderChatText(description, this.actor)}</p>` : ''}
            ${empowered && empowermentDescription ? `<p><strong>Empowerment:</strong> ${empowermentDescription}</p>` : ''}
            ${configuredAreaButton(item.system)}
            ${itemEffectsChatContent(item, this.actor)}
          `,
          rolls: messageRolls
        });
      });

      html.find('.spell-drop-zone').on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      }).on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      }).on('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const skillKey = event.currentTarget.dataset.skill;
        const data = getDragItemData(event);
        if (!data) return;

        let item;
        if (typeof Item.fromDropData === 'function') {
          item = await Item.fromDropData(data);
        }
        if (!item && data.uuid) {
          item = await fromUuid(data.uuid);
        }
        if (!item) return;
        const isSpell = item.type === 'spell';
        const isMagicItem = item.type === 'gear' && String(item.system?.category ?? '').trim() === 'magic_item';
        if (!isSpell && !isMagicItem) return;
        const isNpcSpellDrop = this.actor.type === 'npc';

        if (!isNpcSpellDrop) {
          const maxTier = getMaxSpellTier(this.actor.system.skills?.[skillKey]);
          const itemTier = Math.max(0, Number(item.system?.tier) || 0);
          if (itemTier > maxTier) {
            ui.notifications.warn(`${skillLabels[skillKey] ?? 'Magic'} ${Number(this.actor.system.skills?.[skillKey]) || 0} can only add spells up to Tier ${maxTier}.`);
            return;
          }

          const skillValue = Math.max(0, Number(this.actor.system.skills?.[skillKey]) || 0);
          const assignedItems = [...this.actor.items].filter((actorItem) => {
            const actorItemIsMagic = actorItem.type === 'spell'
              || (actorItem.type === 'gear' && String(actorItem.system?.category ?? '').trim() === 'magic_item');
            const assignedSkill = String(actorItem.type === 'spell'
              ? (actorItem.system?.magicSkill ?? '')
              : (actorItem.system?.skill ?? '')).trim();
            return actorItemIsMagic && assignedSkill === skillKey && actorItem.id !== item.id;
          });
          if (assignedItems.length >= skillValue) {
            ui.notifications.warn(`${skillLabels[skillKey] ?? 'Magic'} can list only ${skillValue} spell${skillValue === 1 ? '' : 's'}.`);
            return;
          }
        }

        if (!item.parent || item.parent !== this.actor) {
          const created = await this.actor.createEmbeddedDocuments('Item', [item.toObject()]);
          item = created[0];
        }

        if (isNpcSpellDrop) {
          this.render();
          return;
        }

        if (item && (item.type === 'spell' || item.type === 'gear')) {
          const itemMagicSkill = String(item.type === 'spell'
            ? (item.system?.magicSkill ?? '')
            : (item.system?.skill ?? '')).trim();

          if (itemMagicSkill && itemMagicSkill !== skillKey) {
            return;
          }

          const updates = {
            'system.tier': Number(item.system?.tier ?? 0) || 0
          };

          if (item.type === 'spell') {
            updates['system.magicSkill'] = skillKey;
          } else {
            updates['system.category'] = 'magic_item';
            updates['system.skill'] = skillKey;
          }

          await item.update(updates);
          this.render();
        }
      });

      html.find('.weapon-unequip').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;
        await item.update({ 'system.equipped': false });
        this.render();
      });
      html.find('.weapon-description').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;
        const description = String(item.system?.description ?? '').trim();
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> examines <strong>${item.name}</strong>.</p>
            ${description ? `<p>${renderChatText(description, this.actor)}</p>` : '<p>No description supplied.</p>'}
          `
        });
      });
      html.find('.gear-description').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;

        const description = String(item.system?.description ?? '').trim();
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> examines <strong>${item.name}</strong>.</p>
            ${description ? `<p>${renderChatText(description, this.actor)}</p>` : '<p>No description supplied.</p>'}
          `
        });
      });
      html.find('.shield-block').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const shield = this.actor.items.get(event.currentTarget.dataset.itemId);
        const isShield = shield?.type === 'gear' && String(shield.system?.category ?? '').trim() === 'shield'
          || shield?.type === 'armor' && shield.system?.armorType === 'shield';
        if (!shield || !isShield || shield.system?.equipped === false) return;

        const chosen = await new Promise((resolve) => {
          new Dialog({
            title: `Block: ${shield.name}`,
            content: `
              <div class="d100-system">
                <form>
                  <div class="form-group"><label>Attribute</label><select name="attribute"><option value="strength">Strength</option><option value="toughness">Toughness</option><option value="observation">Observation</option><option value="reflex">Reflex</option><option value="majesty">Majesty</option></select></div>
                  <div class="form-group"><label>Songs</label><input type="number" name="songs" value="0" min="0" /></div>
                  <div class="form-group"><label>Swords</label><input type="number" name="swords" value="0" min="0" /></div>
                </form>
              </div>
            `,
            buttons: {
              roll: {
                label: 'Roll d100',
                callback: (html) => resolve(new foundry.applications.ux.FormDataExtended(html[0].querySelector('form')).object)
              }
            },
            default: 'roll',
            close: () => resolve(null)
          }, { classes: ['dialog', 'd100-system'] }).render(true);
        });
        if (!chosen) return;

        const attributeKey = chosen.attribute ?? 'strength';
        const songs = Math.max(0, Number(chosen.songs) || 0);
        const swords = Math.max(0, Number(chosen.swords) || 0);
        const attributeValue = Number(this.actor.system.attributes?.[attributeKey]) || 0;
        const skillValue = Number(this.actor.system.skills?.shields) || 0;
        const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + skillValue + songs - swords));
        const roll = await new Roll('1d100').evaluate();
        const degreeInfo = getDegreeInfo(roll.total, targetNumber);
        const succeeded = degreeInfo.type === 'success' || degreeInfo.type === 'critical-success';

        if (succeeded) {
          await this.actor.setFlag('d100-system', 'activeShieldId', shield.id);
        }
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> attempts to block with <strong>${shield.name}</strong>.</p>
            <p>TN: ${targetNumber} (${attributeValue}×10 + ${skillValue} + ${songs} Songs - ${swords} Swords)</p>
            <p>Roll: ${roll.total}</p>
            <p><strong>${degreeInfo.label}</strong></p>
            ${succeeded ? `<p>Defense increased by ${Number(shield.system?.defense) || 0} until the shield is lowered.</p>` : ''}
            ${skillTalentsChatContent(this.actor, 'shields')}
          `,
          rolls: [roll]
        });
        this.render();
      });
      html.find('.shield-lower').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const shieldId = event.currentTarget.dataset.itemId;
        if (this.actor.flags?.['d100-system']?.activeShieldId !== shieldId) return;
        await this.actor.unsetFlag('d100-system', 'activeShieldId');
        this.render();
      });
      html.find('.weapon-skill-roll').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;

        const skillKey = String(item.system?.skill ?? 'light_weapons').trim() || 'light_weapons';
        const skillLabel = skillLabels[skillKey] ?? skillKey;
        const allowedAttributes = ['strength', 'toughness', 'observation', 'reflex', 'majesty'];
        const attributeOptions = allowedAttributes
          .map((value) => `<option value="${value}">${attributeLabels[value] ?? value}</option>`)
          .join('');

        const isMeleeAttack = skillKey !== 'ranged_weapons';
        const targetedActors = [...(game.user?.targets ?? [])].map((token) => token.actor).filter(Boolean);
        const attackerConditionBonus = targetedActors.reduce((totals, targetActor) => {
          const bonus = calculateAttackerConditionBonus(targetActor, { isMelee: isMeleeAttack });
          return { songs: totals.songs + bonus.songs, swords: totals.swords + bonus.swords };
        }, { songs: 0, swords: 0 });

        const chosen = await new Promise((resolve) => {
          new Dialog({
            title: `Weapon Skill: ${item.name}`,
            content: `
              <div class="d100-system">
                <form>
                  <div class="form-group">
                    <label>Attribute</label>
                    <select name="attribute">${attributeOptions}</select>
                  </div>
                  <div class="form-group">
                    <label>Songs${attackerConditionBonus.songs ? ` (${attackerConditionBonus.songs} from target's Conditions)` : ''}</label>
                    <input type="number" name="songs" value="${attackerConditionBonus.songs}" min="0" />
                  </div>
                  <div class="form-group">
                    <label>Swords${attackerConditionBonus.swords ? ` (${attackerConditionBonus.swords} from target's Conditions)` : ''}</label>
                    <input type="number" name="swords" value="${attackerConditionBonus.swords}" min="0" />
                  </div>
                </form>
              </div>
            `,
            buttons: {
              roll: {
                label: 'Roll d100',
                callback: (html) => {
                  const form = html[0].querySelector('form');
                  const formData = new foundry.applications.ux.FormDataExtended(form);
                  resolve(formData.object);
                }
              }
            },
            default: 'roll',
            close: () => resolve(null)
          }, { classes: ['dialog', 'd100-system'] }).render(true);
        });

        if (!chosen) return;

        const attributeKey = chosen.attribute ?? 'strength';
        const songs = Math.max(0, Number(chosen.songs) || 0);
        const swords = Math.max(0, Number(chosen.swords) || 0);
        const attributeValue = Number(this.actor.system.attributes[attributeKey]) || 0;
        const skillValue = Number(this.actor.system.skills[skillKey]) || 0;
        const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + skillValue + songs - swords));
        const roll = await new Roll('1d100').evaluate();
        const degreeInfo = getDegreeInfo(roll.total, targetNumber);
        const damageDice = parseDiceExpression(item.system?.damageDice ?? item.system?.damage ?? '1d6');
        const damageFormula = skillValue > 0 ? `${damageDice} + ${skillValue}` : damageDice;
        const damageRoll = await new Roll(damageFormula).evaluate();
        const rawDamageType = String(item.system?.damageType ?? 'damage').trim() || 'damage';
        const damageType = rawDamageType.charAt(0).toUpperCase() + rawDamageType.slice(1);
        const bonusDamage = Object.entries(getWeaponDamageBonuses(item))
          .filter(([, value]) => (Number(value) || 0) !== 0)
          .map(([type, value]) => ({ type: getResistanceTypeLabel(type), rawType: type, value: Number(value) || 0 }));
        const bonusDamageSummary = bonusDamage
          .map((bonus) => `<p><strong>${bonus.type} Damage:</strong> ${bonus.value}</p>${buildApplyEffectButton(bonus.value, bonus.rawType)}`)
          .join('');
        const description = String(item.system?.description ?? '').trim();

        let revealNote = '';
        const hiddenEntry = getActorActiveConditions(this.actor).find((entry) => entry.def.revealedByAttack);
        if (hiddenEntry) {
          await removeConditionStacks(this.actor, hiddenEntry.key, null);
          revealNote = `<p><em>${this.actor.name} is revealed by making an Attack Check.</em></p>`;
        }

        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> uses <strong>${item.name}</strong> with <strong>${skillLabel}</strong>.</p>
            <p>TN: ${targetNumber} (${attributeValue}×10 + ${skillValue} + ${songs} Songs - ${swords} Swords)</p>
            <p>Roll: ${roll.total}</p>
            <p><strong>${degreeInfo.label}</strong></p>
            <p><strong>${damageType} Damage:</strong> ${damageRoll.total} (${damageFormula})</p>
            ${buildApplyEffectButton(damageRoll.total, rawDamageType)}
            ${bonusDamageSummary}
            ${skillTalentsChatContent(this.actor, skillKey)}
            ${configuredAreaButton(item.system)}
            ${description ? `<details><summary>Description</summary><p>${renderChatText(description, this.actor)}</p></details>` : ''}
            ${revealNote}
          `,
          rolls: [roll, damageRoll]
        });
      });
      html.find('.weapon-damage-roll').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;

        const diceExpression = parseDiceExpression(item.system?.damageDice ?? item.system?.damage ?? '1d6');
        const roll = await new Roll(diceExpression).evaluate();
        const rawDamageType = String(item.system?.damageType ?? 'damage').trim() || 'damage';

        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> deals damage with <strong>${item.name}</strong>.</p>
            <p>Damage Roll: ${roll.total} (${diceExpression})</p>
            ${buildApplyEffectButton(roll.total, rawDamageType)}
            ${configuredAreaButton(item.system)}
          `,
          rolls: [roll]
        });
      });
      html.find('.profession-feature-send').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        this._rememberFeatureOpen(event, 'profession');
        this._onProfessionFeatureSend(event);
      });
      html.find('.profession-feature-resource').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        this._rememberFeatureOpen(event, 'profession');
        this._onProfessionFeatureResource(event);
      });
      html.find('.race-feature-send').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        this._rememberFeatureOpen(event, 'race');
        this._onRaceFeatureSend(event);
      });
      html.find('.race-feature-use').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        this._rememberFeatureOpen(event, 'race');
        this._onRaceFeatureUse(event);
      });
      html.find('.attribute-tab').click(async (event) => {
        const tabName = event.currentTarget.dataset.tab;
        this._activeAttributeTab = tabName;
        if (this.actor) {
          await this.actor.setFlag('d100-system', 'activeAttributeTab', tabName);
        }
        const parent = event.currentTarget.closest('.attribute-panel');
        if (!parent) return;

        parent.querySelectorAll('.attribute-tab').forEach((button) => {
          button.classList.toggle('active', button === event.currentTarget);
        });
        parent.querySelectorAll('.attribute-tab-content').forEach((panel) => {
          panel.classList.toggle('active', panel.dataset.tabContent === tabName);
        });
      });

      html.find('.detail-tab').click(async (event) => {
        const tabName = event.currentTarget.dataset.tab;
        this._activeDetailTab = tabName;
        if (this.actor) {
          await this.actor.setFlag('d100-system', 'activeDetailTab', tabName);
        }
        const parent = event.currentTarget.closest('.detail-panel');
        if (!parent) return;

        parent.querySelectorAll('.detail-tab').forEach((button) => {
          button.classList.toggle('active', button === event.currentTarget);
        });
        parent.querySelectorAll('.detail-tab-content').forEach((panel) => {
          panel.classList.toggle('active', panel.dataset.tabContent === tabName);
        });
      });

      html.find('.resistance-modifier-input').change(async (event) => {
        const type = String(event.currentTarget.dataset.resistanceType || '').trim().toLowerCase();
        const currentSource = this.actor.system.resistanceMod && typeof this.actor.system.resistanceMod === 'object' && Object.keys(this.actor.system.resistanceMod).length
          ? this.actor.system.resistanceMod
          : this.actor.system.resistances;
        const current = currentSource && typeof currentSource === 'object'
          ? { ...currentSource }
          : {};

        current[type] = Number(event.currentTarget.value) || 0;

        await this.actor.update({ 'system.resistanceMod': current });
        this.render();
      });

      html.find('.apply-condition-button').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const row = event.currentTarget.closest('.condition-apply-row');
        const conditionKey = row?.querySelector('.condition-select')?.value;
        const stacks = Math.max(1, Math.floor(Number(row?.querySelector('.condition-stacks-input')?.value) || 1));
        if (!conditionKey) return;
        await applyConditionToActor(this.actor, conditionKey, stacks);
        this.render();
      });
      html.find('.condition-stack-remove').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const conditionKey = event.currentTarget.dataset.conditionKey;
        if (!conditionKey) return;
        await removeConditionStacks(this.actor, conditionKey, 1);
        this.render();
      });
      html.find('.condition-remove').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const effectId = event.currentTarget.dataset.effectId;
        if (!effectId) return;
        await this.actor.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        this.render();
      });
      html.find('.condition-row').click((event) => {
        if (event.target.closest('button')) return;
        const effect = this.actor.effects.get(event.currentTarget.dataset.effectId);
        if (effect) effect.sheet?.render(true);
      });

      html.find('.remove-active-effect').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const effectId = event.currentTarget.dataset.effectId;
        if (!effectId) return;
        await this.actor.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        this.render();
      });
      html.find('.active-effect-row').on('contextmenu', async (event) => {
        event.preventDefault();
        const effectId = event.currentTarget.dataset.effectId;
        if (!effectId) return;
        await this.actor.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        this.render();
      });
      html.find('.active-effect-row').click((event) => {
        if (event.target.closest('input, button')) return;
        const effect = this.actor.effects.get(event.currentTarget.dataset.effectId);
        if (effect) effect.sheet?.render(true);
      });
      html.find('.effect-state-toggle').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const effect = this.actor.effects.get(event.currentTarget.dataset.effectId);
        if (!effect) return;
        await effect.update({ disabled: !effect.disabled });
        this.render();
      });
      html.find('.active-effects-display .create-active-effect').click(async (event) => {
        event.preventDefault();
        const disabled = event.currentTarget.dataset.effectDisabled === 'true';
        const [effect] = await this.actor.createEmbeddedDocuments('ActiveEffect', [{
          name: 'New Active Effect',
          disabled,
          flags: { 'd100-system': { quantity: 1 } }
        }]);
        effect?.sheet?.render(true);
        this.render();
      });
      html.find('.active-effect-quantity').change(async (event) => {
        const effect = this.actor.effects.get(event.currentTarget.dataset.effectId);
        if (!effect) return;
        await effect.update({ 'flags.d100-system.quantity': Math.max(0, Number(event.currentTarget.value) || 0) });
        this.render();
      });
      html.find('.active-effect-drop-zone').on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      }).on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      }).on('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = getDragItemData(event);
        if (!data || data.type !== 'ActiveEffect') return;
        const effect = await ActiveEffect.fromDropData(data);
        if (!effect) return;
        await this.actor.createEmbeddedDocuments('ActiveEffect', [effect.toObject()]);
        this.render();
      });

      html.find('.add-healing-row').click(async () => {
        const entries = Array.isArray(this.actor.system.healing) ? [...this.actor.system.healing] : [];
        entries.push({ healer: '', source: '', times: 0, reset: 'short-rest' });
        await this.actor.update({ 'system.healing': entries });
        this.render();
      });

      html.find('.remove-healing-row').click(async (event) => {
        const index = Number(event.currentTarget.dataset.index) || 0;
        const entries = Array.isArray(this.actor.system.healing) ? [...this.actor.system.healing] : [];
        entries.splice(index, 1);
        await this.actor.update({ 'system.healing': entries });
        this.render();
      });

      html.find('.healing-field').change(async (event) => {
        const row = event.currentTarget.closest('.healing-row');
        if (!row) return;

        const index = Number(row.dataset.healingIndex) || 0;
        const entries = Array.isArray(this.actor.system.healing) ? [...this.actor.system.healing] : [];
        const current = entries[index] ?? { healer: '', source: '', times: 0, reset: 'short-rest' };
        const field = event.currentTarget.dataset.field;

        current[field] = field === 'times' ? Math.max(0, Number(event.currentTarget.value) || 0) : event.currentTarget.value;
        if (field === 'reset') {
          current.reset = event.currentTarget.value === 'long-rest' ? 'long-rest' : 'short-rest';
        }

        entries[index] = current;
        await this.actor.update({ 'system.healing': entries });
        this.render();
      });

      html.find('.scar-pip').click(async (event) => {
        if (!this._editMode) return;
        event.preventDefault();
        event.stopPropagation();
        const index = Number(event.currentTarget.dataset.scarIndex) || 0;
        const currentValue = Number(this.actor.system.scars) || 0;
        const toughness = Number(this.actor.system.attributes?.toughness) || 1;
        const level = Number(this.actor.system.level) || 1;
        const scarBonusLevels = [5, 9, 13, 17];
        const maxValue = 1 + toughness + scarBonusLevels.filter((value) => value <= level).length;
        const nextValue = index < currentValue ? index : index + 1;
        const safeValue = Math.min(maxValue, Math.max(0, nextValue));
        const diff = safeValue - currentValue;

        if (diff !== 0) {
          await this.actor.update({ 'system.scars': safeValue });
          const actorName = this.actor.name || 'Character';
          const verb = diff > 0 ? 'gained' : 'lost';
          const count = Math.abs(diff);
          const label = `${actorName} has ${verb} ${count} Scar${count === 1 ? '' : 's'} and now has ${safeValue} out of ${maxValue}`;

          if (typeof ChatMessage !== 'undefined') {
            const chatHtml = `
              <div class="d100-scar-change-chat">
                <div class="d100-scar-change-header">Scar Update</div>
                <div class="d100-scar-change-body">${label}</div>
              </div>
            `;

            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({ actor: this.actor }),
              content: chatHtml
            });
          }
        }

        this.render();
      });

      const dropZones = html.find('[data-drop-area="creation"]');
      const raceDropZones = html.find('[data-drop-area="race"]');
      dropZones.on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      });
      dropZones.on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      });
      dropZones.on('drop', this._onCharacterCreationDrop.bind(this));

      raceDropZones.on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      });
      raceDropZones.on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      });
      raceDropZones.on('drop', this._onRaceDrop.bind(this));

      const categoryDropZones = html.find('[data-drop-area="npc-category"]');
      categoryDropZones.on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      });
      categoryDropZones.on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      });
      categoryDropZones.on('drop', this._onCategoryDrop.bind(this));
    }

    async _onDrop(event) {
      this._rememberOpenSkillTalentSections(this.element);
      if (this.actor.type === 'npc') {
        const data = getDragItemData(event);
        const dragType = data?.type ?? data?.documentType ?? data?.document?.type ?? data?.data?.type;
        if (data && (dragType === 'Item' || dragType === 'item')) {
          let item = typeof Item.fromDropData === 'function' ? await Item.fromDropData(data) : null;
          if (!item && data.uuid) item = await fromUuid(data.uuid);
          if (item?.type === 'npcAction') {
            if (item.system?.auraAction && !this.actor.system.auraActions) {
              ui.notifications.warn('Enable Aura Actions before adding NPC Actions.');
              return;
            }
            const limit = Math.max(0, Math.floor(Number(this.actor.system.auraActionCount) || 0));
            const currentCount = this.actor.items.filter((entry) => entry.type === 'npcAction' && entry.system?.auraAction).length;
            if (item.system?.auraAction && currentCount >= limit) {
              ui.notifications.warn(`This NPC can have only ${limit} Aura Action${limit === 1 ? '' : 's'}.`);
              return;
            }
          }
        }
      }
      return super._onDrop(event);
    }

    async _onCharacterCreationDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      const data = getDragItemData(event);
      if (!data) return;

      const dragType = data.type ?? data.documentType ?? data.document?.type ?? data.data?.type;
      if (dragType !== 'Item' && dragType !== 'item') return;

      let item = null;
      if (typeof Item.fromDropData === 'function') {
        item = await Item.fromDropData(data);
      }
      if (!item && data.uuid) {
        item = await fromUuid(data.uuid);
      }
      if (!item || !['profession', 'talent', 'gear', 'weapon'].includes(item.type)) return;

      if (item.type !== 'profession') return;

      const professionSystem = item.system ?? {};
      const fixedSkillGrants = Object.entries(professionSystem.skillGrants ?? {})
        .filter(([, enabled]) => !!enabled)
        .map(([key]) => ({ skill: key, points: 3 }));
      const fixedSkillGrantKeys = new Set(fixedSkillGrants.map((bonus) => bonus.skill));
      const legacyChoiceSkillKeys = Object.entries(professionSystem.skillChoices ?? {})
        .filter(([, enabled]) => !!enabled)
        .map(([key]) => key);
      const legacyChoiceCount = Math.max(0, Math.floor(Number(professionSystem.skillChoiceCount) || 0));
      const configuredChoiceGroups = Object.entries(professionSystem.skillChoiceGroups ?? {})
        .map(([id, group], index) => ({
          id,
          label: String(group?.label ?? '').trim() || `Choice ${index + 1}`,
          skills: Object.entries(group?.skills ?? {})
            .filter(([, enabled]) => !!enabled)
            .map(([key]) => key)
        }))
        .filter((group) => group.skills.length);
      const legacyChoiceGroups = !configuredChoiceGroups.length && legacyChoiceCount && legacyChoiceSkillKeys.length
        ? Array.from({ length: legacyChoiceCount }, (_, index) => ({ id: `legacy${index}`, label: `Choice ${index + 1}`, skills: legacyChoiceSkillKeys }))
        : [];
      const choiceGroups = configuredChoiceGroups.length ? configuredChoiceGroups : legacyChoiceGroups;
      const selectedBonuses = [];

      if (choiceGroups.length) {
        const validChoiceGroups = choiceGroups.map((group) => ({
          ...group,
          skills: group.skills.filter((key) => Object.prototype.hasOwnProperty.call(this.actor.system.skills ?? {}, key) && !fixedSkillGrantKeys.has(key))
        })).filter((group) => group.skills.length);
        const fieldHtml = validChoiceGroups.map((group, index) => {
          const choices = group.skills
            .map((key) => `<option value="${key}">${skillLabels[key] ?? key}</option>`)
            .join('');
          return `
          <div class="form-group">
            <label>${group.label}</label>
            <select name="choice${index}" data-profession-skill-choice>${choices}</select>
          </div>
        `;
        }).join('');

        const selected = fieldHtml ? await new Promise((resolve) => {
          new Dialog({
            title: `${item.name} skill choices`,
            content: `<div class="d100-system"><form>${fieldHtml}</form></div>`,
            buttons: {
              apply: {
                label: 'Apply',
                callback: (html) => {
                  const form = html[0].querySelector('form');
                  const formData = new foundry.applications.ux.FormDataExtended(form);
                  const selectedSkills = Object.values(formData.object);
                  if (new Set(selectedSkills).size !== selectedSkills.length) {
                    ui.notifications.warn('Choose a different skill for each Profession skill choice.');
                    return false;
                  }
                  resolve(formData.object);
                }
              }
            },
            default: 'apply',
            close: () => resolve(null),
            render: (html) => {
              const selects = [...html[0].querySelectorAll('[data-profession-skill-choice]')];
              const updateDisabledOptions = () => {
                const usedSkills = new Set();
                selects.forEach((select) => {
                  select.querySelectorAll('option').forEach((option) => {
                    option.disabled = usedSkills.has(option.value);
                  });
                  if (select.selectedOptions[0]?.disabled) {
                    const replacement = [...select.options].find((option) => !option.disabled);
                    if (replacement) select.value = replacement.value;
                  }
                  if (select.value) usedSkills.add(select.value);
                });
              };
              selects.forEach((select) => select.addEventListener('change', updateDisabledOptions));
              updateDisabledOptions();
            }
          }, { classes: ['dialog', 'd100-system'] }).render(true);
        }) : null;

        if (validChoiceGroups.length && !selected) {
          ui.notifications.warn('Choose Profession skills before applying this Profession.');
          return;
        }

        Object.values(selected ?? {}).forEach((skill) => {
          if (validChoiceGroups.some((group) => group.skills.includes(skill))) selectedBonuses.push({ skill, points: 3 });
        });
      }

      const hasNewSkillGrantConfig = Object.keys(professionSystem.skillGrants ?? {}).length
        || Object.keys(professionSystem.skillChoiceGroups ?? {}).length;
      const legacySkillBonuses = !hasNewSkillGrantConfig && Array.isArray(professionSystem.skillBonuses) ? professionSystem.skillBonuses : [];
      const finalBonuses = [...fixedSkillGrants, ...selectedBonuses, ...legacySkillBonuses];
      const updates = {};

      if (professionSystem.level !== undefined) {
        updates['system.level'] = Math.max(1, Math.min(20, Number(professionSystem.level) || this.actor.system.level));
      }

      const resourceType = resourceOptions.includes(professionSystem.resource) ? professionSystem.resource : 'adrenaline';
      const startingLevel = Math.max(1, Number(this.actor.system.level) || 1);
      const defaultResourceMax = Math.max(5, startingLevel * 5);
      updates['system.resource.type'] = resourceType;
      updates['system.resource.modifier'] = 0;
      updates['system.resource.value'] = defaultResourceMax;
      updates['system.profession'] = item.name;

      if (professionSystem.attributes) {
        for (const [key, value] of Object.entries(professionSystem.attributes)) {
          const numericValue = Number(value) || 0;
          if (Object.prototype.hasOwnProperty.call(this.actor.system.attributes ?? {}, key) && numericValue > 0) {
            updates[`system.attributes.${key}`] = numericValue;
          }
        }
      }

      if (professionSystem.skills) {
        for (const [key, value] of Object.entries(professionSystem.skills)) {
          const numericValue = Number(value) || 0;
          if (Object.prototype.hasOwnProperty.call(this.actor.system.skills ?? {}, key) && numericValue > 0) {
            updates[`system.skills.${key}`] = numericValue;
          }
        }
      }

      for (const bonus of finalBonuses) {
        const skillKey = bonus.skill;
        const points = Number(bonus.points) || 0;
        if (Object.prototype.hasOwnProperty.call(this.actor.system.skills ?? {}, skillKey)) {
          const currentValue = Number(this.actor.system.skills[skillKey]) || 0;
          updates[`system.skills.${skillKey}`] = currentValue + points;
        }
      }

      const baseHealth = Number(professionSystem.baseHealth ?? professionSystem.health?.max ?? 0) || 0;
      if (baseHealth > 0) {
        updates['system.baseHealth'] = baseHealth;
      }

      if (professionSystem.health && professionSystem.health.value !== undefined) {
        const healthValue = Number(professionSystem.health.value) || 0;
        if (healthValue > 0) {
          updates['system.health.value'] = healthValue;
        }
      }

      const professionData = {
        name: item.name,
        type: 'profession',
        img: item.img,
        system: foundry.utils.mergeObject(item.system ?? {}, {
          resource: professionSystem.resource ?? resourceType,
          baseHealth: Number(professionSystem.baseHealth) || 0,
          skillBonuses: legacySkillBonuses,
          optionalSkillBonuses: !!professionSystem.optionalSkillBonuses,
          bonusChoices: Array.isArray(professionSystem.bonusChoices) ? professionSystem.bonusChoices : [],
          skillGrants: professionSystem.skillGrants ?? {},
          skillChoices: professionSystem.skillChoices ?? {},
          skillChoiceCount: legacyChoiceCount,
          skillChoiceGroups: professionSystem.skillChoiceGroups ?? {},
          level: Number(professionSystem.level) || 1,
          attributes: professionSystem.attributes ?? {},
          skills: professionSystem.skills ?? {},
          health: professionSystem.health ?? { value: 0, max: 0 },
          origin: professionSystem.origin ?? '',
          features: professionSystem.features ?? {
            '1': '',
            '3': '',
            '5': '',
            '7': '',
            '9': ''
          },
          characterCreation: true
        })
      };

      const professionItems = [...this.actor.items.filter((actorItem) => actorItem.type === 'profession')].sort((a, b) => {
        const aTime = Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0);
        const bTime = Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0);
        return bTime - aTime;
      });

      for (const oldProfession of professionItems.slice(1)) {
        await oldProfession.delete();
      }

      const activeProfession = professionItems[0];
      if (activeProfession) {
        await activeProfession.update(professionData);
      } else {
        await this.actor.createEmbeddedDocuments('Item', [professionData]);
      }

      if (Object.keys(updates).length) {
        await this.actor.update(updates);
        ui.notifications.info(`${item.name} applied to ${this.actor.name}.`);
      }
    }

    async _onProfessionFeatureSend(event) {
      event.preventDefault();
      const level = Number(event.currentTarget.dataset.featureLevel) || 1;
      const profession = [...(this.actor.items ?? [])]
        .filter((item) => item.type === 'profession')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .shift();
      const featureMap = profession?.system?.features ?? {};
      const entry = featureMap[String(level)] ?? featureMap[level] ?? {};
      const normalized = typeof entry === 'string'
        ? { title: '', text: entry }
        : { title: entry?.title ?? '', text: entry?.text ?? '', ...entry };
      const title = normalized.title?.trim();
      const text = normalized.text?.trim();
      if (!text) return;

      const featureTitle = title ? `${title}` : `Level ${level} Feature`;
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `
          <p><strong>${this.actor.name}</strong> uses <strong>${profession?.name ?? 'Profession'}</strong> — ${featureTitle}</p>
          <p>${renderChatText(text, this.actor)}</p>
            ${configuredAreaButton(normalized)}
            ${itemEffectsChatContent(profession, this.actor)}
        `
      });
    }

    async _onProfessionFeatureResource(event) {
      event.preventDefault();
      event.stopPropagation();

      const level = Number(event.currentTarget.dataset.featureLevel) || 1;
      const direction = event.currentTarget.dataset.direction === 'loss' ? 'loss' : 'gain';
      const profession = [...(this.actor.items ?? [])]
        .filter((item) => item.type === 'profession')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .shift();
      const feature = profession?.system?.features?.[String(level)] ?? profession?.system?.features?.[level] ?? {};
      const amount = Number(direction === 'loss' ? (feature.resourceLoss ?? feature.loss ?? 0) : (feature.resourceGain ?? feature.gain ?? 0)) || 0;
      if (amount <= 0) return;

      const resource = this.actor.system.resource ?? {};
      const maxResource = Math.max(0, (Number(this.actor.system.level) || 1) * 5 + (Number(resource.modifier) || 0));
      const currentValue = Number(resource.value) || 0;
      const nextValue = direction === 'loss'
        ? Math.max(0, currentValue - amount)
        : Math.min(maxResource, currentValue + amount);

      await this.actor.update({ 'system.resource.value': nextValue });
      this.render();
    }

    async _onRaceDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      const data = getDragItemData(event);
      if (!data) return;

      const dragType = data.type ?? data.documentType ?? data.document?.type ?? data.data?.type;
      if (dragType !== 'Item' && dragType !== 'item') return;

      let item = null;
      if (typeof Item.fromDropData === 'function') {
        item = await Item.fromDropData(data);
      }
      if (!item && data.uuid) {
        item = await fromUuid(data.uuid);
      }
      if (!item || item.type !== 'race') return;

      const raceSystem = item.system ?? {};
      const movement = Number(raceSystem.movement) || 0;
      const languageUpdates = await getRaceLanguageUpdates(this.actor, raceSystem);
      if (!languageUpdates) return;
      const updates = {
        'system.race': item.name,
        'system.movement': movement,
        ...languageUpdates
      };

      const raceData = {
        name: item.name,
        type: 'race',
        img: item.img,
        system: foundry.utils.mergeObject(item.system ?? {}, {
          movement,
          features: raceSystem.features ?? {
            '1': { title: '', text: '' },
            '5': { title: '', text: '' },
            '10': { title: '', text: '' },
            '15': { title: '', text: '' }
          }
        })
      };

      const raceItems = [...this.actor.items.filter((actorItem) => actorItem.type === 'race')].sort((a, b) => {
        const aTime = Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0);
        const bTime = Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0);
        return bTime - aTime;
      });

      for (const oldRace of raceItems.slice(1)) {
        await oldRace.delete();
      }

      const activeRace = raceItems[0];
      let actorRace = activeRace;
      if (activeRace) {
        await activeRace.update(raceData);
      } else {
        [actorRace] = await this.actor.createEmbeddedDocuments('Item', [raceData]);
      }

      if (actorRace && actorRace.uuid !== item.uuid) {
        await replaceItemEffectsFromSource(actorRace, item);
        await syncAutomaticItemEffects(actorRace);
      }

      await this.actor.update(updates);
      ui.notifications.info(`${item.name} applied to ${this.actor.name}.`);
    }

    async _onCategoryDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      const data = getDragItemData(event);
      if (!data) return;

      const dragType = data.type ?? data.documentType ?? data.document?.type ?? data.data?.type;
      if (dragType !== 'Item' && dragType !== 'item') return;

      let item = null;
      if (typeof Item.fromDropData === 'function') {
        item = await Item.fromDropData(data);
      }
      if (!item && data.uuid) {
        item = await fromUuid(data.uuid);
      }
      if (!item || item.type !== 'category') return;

      const categoryData = {
        name: item.name,
        type: 'category',
        img: item.img,
        system: foundry.utils.deepClone(item.system ?? {})
      };

      const categoryItems = [...this.actor.items.filter((actorItem) => actorItem.type === 'category')].sort((a, b) => {
        const aTime = Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0);
        const bTime = Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0);
        return bTime - aTime;
      });

      for (const oldCategory of categoryItems.slice(1)) {
        await oldCategory.delete();
      }

      const activeCategory = categoryItems[0];
      let actorCategory = activeCategory;
      if (activeCategory) {
        await activeCategory.update(categoryData);
      } else {
        [actorCategory] = await this.actor.createEmbeddedDocuments('Item', [categoryData]);
      }

      if (actorCategory && actorCategory.uuid !== item.uuid) {
        await replaceItemEffectsFromSource(actorCategory, item);
        await syncAutomaticItemEffects(actorCategory);
      }

      await this.actor.update({ 'system.category': item.name, 'system.categoryTraitChoices': {} });
      ui.notifications.info(`${item.name} applied to ${this.actor.name}.`);

      const currentLevel = Math.max(1, Math.floor(Number(this.actor.system.level) || 1));
      await this._reconcileCategoryTraitChoices(actorCategory, 0, currentLevel);
    }

    async _reconcileCategoryTraitChoices(category, oldLevel, newLevel) {
      if (!category || this.actor.type !== 'npc') return;

      const choices = foundry.utils.deepClone(this.actor.system.categoryTraitChoices ?? {});
      const removalUpdates = {};
      for (const bucket of categoryTraitBucketDefs) {
        if (bucket.level > newLevel && choices[bucket.key]) {
          removalUpdates[`system.categoryTraitChoices.-=${bucket.key}`] = null;
          delete choices[bucket.key];
        }
      }
      if (Object.keys(removalUpdates).length) {
        await this.actor.update(removalUpdates);
      }

      const newlyUnlocked = categoryTraitBucketDefs.filter((bucket) => {
        if (bucket.level > newLevel || choices[bucket.key]) return false;
        const options = category.system?.[bucket.field];
        return Array.isArray(options) && options.length > 0;
      });

      if (newlyUnlocked.length) {
        await this._promptCategoryTraitChoices(category, newlyUnlocked);
      }
    }

    async _promptCategoryTraitChoices(category, buckets) {
      const fieldsHtml = buckets.map((bucket) => {
        const options = (category.system?.[bucket.field] ?? [])
          .map((entry) => `<option value="${entry.uuid}">${entry.name}</option>`)
          .join('');
        return `
          <div class="form-group">
            <label>${bucket.label}</label>
            <select name="${bucket.key}">${options}</select>
          </div>
        `;
      }).join('');

      const chosen = await new Promise((resolve) => {
        new Dialog({
          title: `Choose Category Traits: ${category.name}`,
          content: `<div class="d100-system"><form>${fieldsHtml}</form></div>`,
          buttons: {
            confirm: {
              label: 'Confirm',
              callback: (dialogHtml) => {
                const root = dialogHtml?.[0] ?? dialogHtml;
                const form = root?.querySelector ? root.querySelector('form') : root;
                const formData = new foundry.applications.ux.FormDataExtended(form);
                resolve(formData.object);
              }
            }
          },
          default: 'confirm',
          close: () => resolve(null)
        }, { classes: ['dialog', 'd100-system'] }).render(true);
      });

      if (!chosen) return;

      const updates = {};
      for (const bucket of buckets) {
        const selectedUuid = chosen[bucket.key];
        const entry = (category.system?.[bucket.field] ?? []).find((option) => option.uuid === selectedUuid);
        if (entry) {
          updates[`system.categoryTraitChoices.${bucket.key}`] = {
            uuid: entry.uuid,
            name: entry.name,
            description: entry.description ?? ''
          };
        }
      }
      if (Object.keys(updates).length) {
        await this.actor.update(updates);
        this.render();
      }
    }

    async _onRaceFeatureSend(event) {
      event.preventDefault();
      const level = Number(event.currentTarget.dataset.featureLevel) || 1;
      const race = [...(this.actor.items ?? [])]
        .filter((item) => item.type === 'race')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .shift();
      const featureMap = race?.system?.features ?? {};
      const entry = featureMap[String(level)] ?? featureMap[level] ?? {};
      const normalized = typeof entry === 'string'
        ? { title: '', text: entry }
        : { title: entry?.title ?? '', text: entry?.text ?? '', ...entry };
      const title = normalized.title?.trim();
      const text = normalized.text?.trim();
      if (!text) return;

      const featureTitle = title ? `${title}` : `Level ${level} Feature`;
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `
          <p><strong>${this.actor.name}</strong> uses <strong>${race?.name ?? 'Race'}</strong> — ${featureTitle}</p>
          <p>${renderChatText(text, this.actor)}</p>
            ${configuredAreaButton(normalized)}
        `
      });
    }

    async _onRaceFeatureUse(event) {
      event.preventDefault();
      event.stopPropagation();
      const level = Number(event.currentTarget.dataset.featureLevel) || 1;
      const action = event.currentTarget.dataset.action === 'undo' ? 'undo' : 'use';
      const currentValue = Number(this.actor.system.raceFeatureUsage?.[String(level)] ?? this.actor.system.raceFeatureUsage?.[level] ?? 0) || 0;
      const race = [...(this.actor.items ?? [])]
        .filter((item) => item.type === 'race')
        .sort((a, b) => (Number(b._stats?.modifiedTime ?? b._source?.updated ?? 0) - Number(a._stats?.modifiedTime ?? a._source?.updated ?? 0)))
        .shift();
      const itemUses = Number(race?.system?.features?.[String(level)]?.uses ?? race?.system?.features?.[level]?.uses ?? 0) || 0;
      if (itemUses <= 0) return;

      const nextValue = action === 'use'
        ? Math.min(itemUses, currentValue + 1)
        : Math.max(0, currentValue - 1);

      await this.actor.update({ [`system.raceFeatureUsage.${level}`]: nextValue });
      this.render();
    }

    async _onRest(event) {
      event.preventDefault();
      event.stopPropagation();
      const restType = event.currentTarget.dataset.restType === 'long' ? 'long' : 'short';
      const level = Math.max(1, Math.min(20, Number(this.actor.system.level) || 1));
      const healthMax = calculateHealthMax(this.actor);
      const currentHealth = Math.max(0, Number(this.actor.system.health?.value) || 0);
      const resource = this.actor.system.resource ?? {};
      const currentResource = Math.max(0, Number(resource.value) || 0);
      const resourceType = String(resource.type ?? 'resource').replace(/^./, (character) => character.toUpperCase());
      const healingEntries = Array.isArray(this.actor.system.healing) ? this.actor.system.healing : [];
      const updates = {};
      let chatContent = '';
      let messageRolls = [];

      if (restType === 'short') {
        const diceCount = level >= 17 ? 16 : level >= 13 ? 8 : level >= 9 ? 4 : level >= 5 ? 2 : 1;
        const baseHealth = Math.max(1, Number(this.actor.system.baseHealth) || 1);
        const formula = `${diceCount}d${baseHealth}`;
        const roll = await new Roll(formula).evaluate();
        messageRolls = [roll];
        const nextHealth = Math.min(healthMax, currentHealth + roll.total);
        updates['system.health.value'] = nextHealth;
        updates['system.healing'] = healingEntries.filter((entry) => String(entry?.reset ?? '').trim() !== 'short-rest');
        chatContent = `
          <p><strong>${this.actor.name}</strong> takes a <strong>Short Rest</strong>.</p>
          <p><strong>Healing:</strong> ${roll.total} (${formula})</p>
          <p>Health: ${currentHealth} → ${nextHealth} / ${healthMax}</p>
        `;
      } else {
        updates['system.health.value'] = healthMax;
        updates['system.resource.value'] = 0;
        updates['system.healing'] = healingEntries.filter((entry) => !['short-rest', 'long-rest'].includes(String(entry?.reset ?? '').trim()));
        chatContent = `
          <p><strong>${this.actor.name}</strong> takes a <strong>Long Rest</strong>.</p>
          <p>Health: ${currentHealth} → ${healthMax} / ${healthMax}</p>
          <p>${resourceType}: ${currentResource} → 0</p>
        `;
      }

      await this.actor.update(updates);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: chatContent,
        rolls: messageRolls
      });
      this.render();
    }

    async _onSaveRoll(event) {
      event.preventDefault();
      try {
        const button = event.currentTarget;
        const attributeKey = button.dataset.attribute;
        const attributeLabel = attributeLabels[attributeKey] ?? attributeKey;
        const attributeValue = Number(this.actor.system.attributes[attributeKey]) || 1;

        const autoFailConditions = getActorActiveConditions(this.actor).filter((entry) => entry.def.autoFailSaves?.includes(attributeKey));
        if (autoFailConditions.length) {
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: `
              <p><strong>${this.actor.name}</strong> automatically fails the ${attributeLabel} save (${autoFailConditions.map((entry) => entry.def.label).join(', ')}).</p>
            `
          });
          return;
        }

        const conditionBonus = calculateConditionOwnRollBonus(this.actor);

        const chosen = await new Promise((resolve) => {
          new Dialog({
            title: `Save: ${attributeLabel}`,
            content: `
              <div class="d100-system">
                <form>
                  <div class="form-group">
                    <label>Songs${conditionBonus.songs ? ` (${conditionBonus.songs} from Conditions)` : ''}</label>
                    <input type="number" name="songs" value="${conditionBonus.songs}" min="0" />
                  </div>
                  <div class="form-group">
                    <label>Swords${conditionBonus.swords ? ` (${conditionBonus.swords} from Conditions)` : ''}</label>
                    <input type="number" name="swords" value="${conditionBonus.swords}" min="0" />
                  </div>
                </form>
              </div>
            `,
            buttons: {
              roll: {
                label: 'Roll d100',
                callback: (dialogHtml) => {
                  const root = dialogHtml?.[0] ?? dialogHtml;
                  const form = root?.querySelector ? root.querySelector('form') : root;
                  const formData = new foundry.applications.ux.FormDataExtended(form);
                  resolve(formData.object);
                }
              }
            },
            default: 'roll',
            close: () => resolve(null)
          }, { classes: ['dialog', 'd100-system'] }).render(true);
        });

        if (!chosen) return;

        const songs = Math.max(0, Number(chosen.songs) || 0);
        const swords = Math.max(0, Number(chosen.swords) || 0);
        const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + songs - swords));
        const roll = await new Roll('1d100').evaluate();
        const degreeInfo = getDegreeInfo(roll.total, targetNumber);

        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> makes a ${attributeLabel} save.</p>
            <p>TN: ${targetNumber} (${attributeValue}×10 + ${songs} Songs - ${swords} Swords)</p>
            <p>Roll: ${roll.total}</p>
            <p><strong>${degreeInfo.label}</strong></p>
          `,
          rolls: [roll]
        });
      } catch (error) {
        console.error('D100 System | Save roll failed', error);
        ui.notifications.error('Something went wrong rolling that save. See console (F12) for details.');
      }
    }

    async _onAttributeCheckRoll(event) {
      event.preventDefault();
      try {
        const button = event.currentTarget;
        const attributeKey = button.dataset.attribute;
        const attributeLabel = attributeLabels[attributeKey] ?? attributeKey;
        const attributeValue = Number(this.actor.system.attributes[attributeKey]) || 0;
        const conditionBonus = calculateConditionOwnRollBonus(this.actor);

        const chosen = await new Promise((resolve) => {
          new Dialog({
            title: `Attribute Check: ${attributeLabel}`,
            content: `
              <div class="d100-system">
                <form>
                  <div class="form-group">
                    <label>Songs${conditionBonus.songs ? ` (${conditionBonus.songs} from Conditions)` : ''}</label>
                    <input type="number" name="songs" value="${conditionBonus.songs}" min="0" />
                  </div>
                  <div class="form-group">
                    <label>Swords${conditionBonus.swords ? ` (${conditionBonus.swords} from Conditions)` : ''}</label>
                    <input type="number" name="swords" value="${conditionBonus.swords}" min="0" />
                  </div>
                </form>
              </div>
            `,
            buttons: {
              roll: {
                label: 'Roll d100',
                callback: (dialogHtml) => {
                  const root = dialogHtml?.[0] ?? dialogHtml;
                  const form = root?.querySelector ? root.querySelector('form') : root;
                  const formData = new foundry.applications.ux.FormDataExtended(form);
                  resolve(formData.object);
                }
              }
            },
            default: 'roll',
            close: () => resolve(null)
          }, { classes: ['dialog', 'd100-system'] }).render(true);
        });

        if (!chosen) return;

        const songs = Number(chosen.songs) || 0;
        const swords = Number(chosen.swords) || 0;
        const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + attributeValue + songs - swords));
        const roll = await new Roll('1d100').evaluate();
        const degreeInfo = getDegreeInfo(roll.total, targetNumber);

        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `
            <p><strong>${this.actor.name}</strong> makes an <strong>${attributeLabel}</strong> check.</p>
            <p>TN: ${targetNumber} (${attributeValue}×10 + ${attributeValue} + ${songs} Songs - ${swords} Swords)</p>
            <p>Roll: ${roll.total}</p>
            <p><strong>${degreeInfo.label}</strong></p>
          `,
          rolls: [roll]
        });
      } catch (error) {
        console.error('D100 System | Attribute check roll failed', error);
        ui.notifications.error('Something went wrong rolling that check. See console (F12) for details.');
      }
    }

    async _onSkillRoll(event) {
      event.preventDefault();
      const button = event.currentTarget;
      const skillKey = button.dataset.skill;
      const skillLabel = skillLabels[skillKey] ?? skillKey;
      const magicSkillKeys = ['cosmic_magic', 'druidic_magic', 'elemental_magic', 'light_magic', 'shadow_magic'];
      const allowedAttributes = magicSkillKeys.includes(skillKey)
        ? ['observation', 'majesty']
        : ['strength', 'toughness', 'observation', 'reflex', 'majesty'];

      const attributeOptions = allowedAttributes
        .map((value) => `<option value="${value}">${attributeLabels[value] ?? value}</option>`)
        .join('');

      const conditionBonus = calculateConditionOwnRollBonus(this.actor);

      const chosen = await new Promise((resolve) => {
        new Dialog({
          title: `Skill Check: ${skillLabel}`,
          content: `
            <div class="d100-system">
              <form>
                <div class="form-group">
                  <label>Attribute</label>
                  <select name="attribute">${attributeOptions}</select>
                </div>
                <div class="form-group">
                  <label>Songs${conditionBonus.songs ? ` (${conditionBonus.songs} from Conditions)` : ''}</label>
                  <input type="number" name="songs" value="${conditionBonus.songs}" min="0" />
                </div>
                <div class="form-group">
                  <label>Swords${conditionBonus.swords ? ` (${conditionBonus.swords} from Conditions)` : ''}</label>
                  <input type="number" name="swords" value="${conditionBonus.swords}" min="0" />
                </div>
              </form>
            </div>
          `,
          buttons: {
            roll: {
              label: 'Roll d100',
              callback: (html) => {
                const form = html[0].querySelector('form');
                const formData = new foundry.applications.ux.FormDataExtended(form);
                resolve(formData.object);
              }
            }
          },
          default: 'roll',
          close: () => resolve(null)
        }, { classes: ['dialog', 'd100-system'] }).render(true);
      });

      if (!chosen) return;

      const attributeKey = chosen.attribute ?? 'strength';
      const songs = Number(chosen.songs) || 0;
      const swords = Number(chosen.swords) || 0;
      const attributeValue = Number(this.actor.system.attributes[attributeKey]) || 0;
      const skillValue = Number(this.actor.system.skills[skillKey]) || 0;
      const targetNumber = Math.max(1, Math.min(100, (attributeValue * 10) + skillValue + songs - swords));
      const roll = await new Roll('1d100').evaluate();
      const degreeInfo = getDegreeInfo(roll.total, targetNumber);

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `
          <p><strong>${this.actor.name}</strong> rolls <strong>${skillLabel}</strong> using ${attributeLabels[attributeKey] ?? attributeKey}.</p>
          <p>TN: ${targetNumber} (${attributeValue}×10 + ${skillValue} + ${songs} Songs - ${swords} Swords)</p>
          <p>Roll: ${roll.total}</p>
          <p><strong>${degreeInfo.label}</strong></p>
        `,
        rolls: [roll]
      });
    }
  }

  class D100ItemSheet extends ItemSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['d100-system', 'sheet', 'item'],
        template: 'systems/d100-system/templates/item/item-sheet.hbs',
        width: 520,
        height: 560,
        tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }]
      });
    }

    getData() {
      const context = super.getData();
      const system = context.item.system ? foundry.utils.deepClone(context.item.system) : {};
      if (system && typeof system.tier !== 'undefined') {
        system.tier = String(system.tier);
      }
      if (context.item.type === 'gear' && system.category === 'consumable' && !['damage', 'healing'].includes(system.consumableEffect)) {
        system.consumableEffect = 'damage';
      }
      if (context.item.type === 'gear' && system.category === 'magic_item' && !['none', 'damage', 'healing'].includes(system.magicItemEffect)) {
        system.magicItemEffect = 'none';
      }
      context.system = system;
      this._editMode = this._editMode ?? !['gear', 'weapon', 'armor', 'profession', 'race', 'talent', 'spell', 'trait', 'npcAction', 'category', 'weaponTechnique'].includes(context.item.type);
      context.isEditMode = !!this._editMode;
      if (context.item.type === 'category') {
        context.categoryTraitBuckets = categoryTraitBucketDefs.map((bucket) => ({
          key: bucket.key,
          label: bucket.label,
          entries: Array.isArray(system[bucket.field]) ? system[bucket.field] : []
        }));
      }
      context.resistanceOptions = resistanceTypeOptions;
      context.actionTypeOptions = actionTypeOptions;
      context.armorResistanceEffects = Object.entries(system.resistances ?? {})
        .filter(([, value]) => (Number(value) || 0) !== 0)
        .map(([type, value]) => ({ label: getResistanceTypeLabel(type), value: Number(value) || 0 }));
      context.languageOptions = languageOptions;
      context.itemEffects = [...(context.item.effects ?? [])].map((effect) => ({
        id: effect.id,
        name: effect.name || 'Active Effect',
        img: effect.img,
        disabled: !!effect.disabled,
        typeLabel: getEffectTypeLabel(effect),
        quantity: Math.max(0, Number(effect.flags?.['d100-system']?.quantity) || 1)
      }));
      context.skillOptions = skillGroups.flatMap((group) =>
        group.keys.map((key) => ({
          key,
          label: skillLabels[key] ?? key
        }))
      );
      context.professionSkillChoiceGroups = Object.entries(system.skillChoiceGroups ?? {})
        .map(([id, group], index) => ({
          id,
          label: String(group?.label ?? '').trim() || `Choice ${index + 1}`,
          skillOptions: context.skillOptions
            .filter((skill) => !system.skillGrants?.[skill.key])
            .map((skill) => ({
              ...skill,
              checked: !!group?.skills?.[skill.key]
            }))
        }));
      context.raceLanguageChoiceGroups = Object.entries(system.languageChoiceGroups ?? {})
        .map(([id, group], index) => {
          const mode = group?.mode === 'specific' ? 'specific' : 'any';
          const selectedLabels = languageOptions.filter((language) => !!group?.languages?.[language.key]).map((language) => language.label);
          return {
            id,
            label: String(group?.label ?? '').trim() || `Language Choice ${index + 1}`,
            mode,
            isAny: mode === 'any',
            isSpecific: mode === 'specific',
            summary: mode === 'any' ? 'Any unknown language' : selectedLabels.join(' or '),
            languageOptions: languageOptions.map((language) => ({
              ...language,
              checked: !!group?.languages?.[language.key]
            }))
          };
        });
      context.raceLanguageChoiceLabels = context.raceLanguageChoiceGroups
        .map((group) => `${group.summary || 'No languages selected'} +1`);
      context.professionFixedSkillGrantLabels = context.skillOptions
        .filter((skill) => !!system.skillGrants?.[skill.key])
        .map((skill) => `${skill.label} +3`);
      context.professionSkillChoiceLabels = context.professionSkillChoiceGroups
        .map((group) => group.skillOptions.filter((skill) => skill.checked).map((skill) => skill.label))
        .filter((labels) => labels.length)
        .map((labels) => `${labels.join(' or ')} +3`);
      context.hasProfessionSkillSummary = !!(context.professionFixedSkillGrantLabels.length || context.professionSkillChoiceLabels.length);
      context.professionFeatureSummaries = ['1', '3', '5', '7', '9']
        .map((level) => {
          const feature = system.features?.[level] ?? {};
          const title = String(feature.title ?? '').trim();
          const text = String(feature.text ?? '').trim();
          const resourceGain = Number(feature.resourceGain) || 0;
          const resourceLoss = Number(feature.resourceLoss) || 0;
          const hasArea = !!feature.areaOfEffect;
          return {
            level,
            title: title || `Level ${level}`,
            text,
            actionTypeLabel: getActionTypeLabel(feature.actionType),
            resourceGain,
            resourceLoss,
            hasArea,
            areaLabel: hasArea ? `Area: ${getAreaShapeLabel(feature.areaShape)}, Size: ${Number(feature.areaSize) || 1}` : '',
            hasContent: !!(title || text || resourceGain || resourceLoss || hasArea)
          };
        })
        .filter((feature) => feature.hasContent);
      context.raceFeatureSummaries = ['1', '5', '10', '15']
        .map((level) => {
          const feature = system.features?.[level] ?? {};
          const title = String(feature.title ?? '').trim();
          const text = String(feature.text ?? '').trim();
          const uses = Number(feature.uses) || 0;
          const hasArea = !!feature.areaOfEffect;
          return {
            level,
            title: title || `Level ${level}`,
            text,
            actionTypeLabel: getActionTypeLabel(feature.actionType),
            uses,
            hasUses: uses > 0,
            hasArea,
            areaLabel: hasArea ? `Area: ${getAreaShapeLabel(feature.areaShape)}, Size: ${Number(feature.areaSize) || 1}` : '',
            hasContent: !!(title || text || uses || hasArea)
          };
        })
        .filter((feature) => feature.hasContent);
      const formatLabel = (value) => String(value ?? '').replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
      const addSummaryField = (fields, label, value, fallback = 'None') => {
        const text = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? '').trim();
        fields.push({ label, value: text || fallback });
      };
      const itemSummaryFields = [];
      if (context.item.type === 'talent') {
        addSummaryField(itemSummaryFields, 'Skill', skillLabels[system.skill] ?? 'None');
        addSummaryField(itemSummaryFields, 'Tier', system.tier ?? 1);
        addSummaryField(itemSummaryFields, 'Action', getActionTypeLabel(system.actionType));
        if ((Number(system.usesPerDay) || 0) > 0) addSummaryField(itemSummaryFields, 'Uses / Day', system.usesPerDay);
      } else if (context.item.type === 'race') {
        const fixedLanguages = languageOptions.filter((language) => !!system.languages?.[language.key]).map((language) => language.label);
        addSummaryField(itemSummaryFields, 'Movement', system.movement ?? 0);
        addSummaryField(itemSummaryFields, 'Languages', fixedLanguages.join(', '));
        if (context.raceLanguageChoiceLabels.length) addSummaryField(itemSummaryFields, 'Player Language Choices', context.raceLanguageChoiceLabels.join('; '));
        else if ((Number(system.languageChoices) || 0) > 0) addSummaryField(itemSummaryFields, 'Player Language Choices', `${system.languageChoices} from any unknown language`);
      } else if (context.item.type === 'weapon') {
        addSummaryField(itemSummaryFields, 'Skill', skillLabels[system.skill] ?? 'Weapon');
        addSummaryField(itemSummaryFields, 'Tier', system.tier ?? 0);
        addSummaryField(itemSummaryFields, 'Damage', `${system.damageDice || '1d6'} ${formatLabel(system.damageType || 'slashing')}`);
        addSummaryField(itemSummaryFields, 'Range', system.range ?? 0);
        addSummaryField(itemSummaryFields, 'Break Points', system.breakPoints ?? 0);
      } else if (context.item.type === 'armor') {
        addSummaryField(itemSummaryFields, 'Type', formatLabel(system.armorType || 'armor'));
        addSummaryField(itemSummaryFields, 'Tier', system.tier ?? 0);
        addSummaryField(itemSummaryFields, 'Defense', system.defense ?? 0);
        addSummaryField(itemSummaryFields, 'Break Points', system.breakPoints ?? 0);
      } else if (context.item.type === 'spell') {
        addSummaryField(itemSummaryFields, 'Tier', system.tier ?? 0);
        addSummaryField(itemSummaryFields, 'Magic Skill', skillLabels[system.magicSkill] ?? 'None');
        addSummaryField(itemSummaryFields, 'Action', getActionTypeLabel(system.actionType));
        addSummaryField(itemSummaryFields, 'Cost', system.resourceCost ?? 0);
        addSummaryField(itemSummaryFields, 'Empowerment Cost', system.empowermentCost ?? 0);
        addSummaryField(itemSummaryFields, 'Dice', `${system.damageHealing || 'None'} ${system.damageType === 'healing' ? 'Healing' : formatLabel(system.damageType || 'healing')}`.trim());
        addSummaryField(itemSummaryFields, 'Range', system.range ?? 0);
        if (system.damageType === 'healing') addSummaryField(itemSummaryFields, 'Healing Tracker', !!system.trackHealing);
        addSummaryField(itemSummaryFields, 'Concentration', !!system.concentration);
      } else if (context.item.type === 'gear') {
        addSummaryField(itemSummaryFields, 'Category', formatLabel(system.category || 'misc'));
        addSummaryField(itemSummaryFields, 'Tier', system.tier ?? 0);
        addSummaryField(itemSummaryFields, 'Action', getActionTypeLabel(system.actionType));
        addSummaryField(itemSummaryFields, 'Quantity', system.quantity ?? 0);
        addSummaryField(itemSummaryFields, 'Cost', `${Number(system.gold) || 0}g ${Number(system.silver) || 0}s ${Number(system.copper) || 0}c`);
        if (system.category === 'consumable') addSummaryField(itemSummaryFields, 'Effect', `${formatLabel(system.consumableEffect || 'damage')} ${system.consumableDice || ''}`.trim());
        if (system.category === 'magic_item') addSummaryField(itemSummaryFields, 'Effect', formatLabel(system.magicItemEffect || 'none'));
      } else if (context.item.type === 'trait') {
        addSummaryField(itemSummaryFields, 'Trait Point Cost', system.traitPointCost ?? 0);
      } else if (context.item.type === 'npcAction') {
        addSummaryField(itemSummaryFields, 'Hazard Action', !!system.isHazardAction);
        if (system.isHazardAction) {
          addSummaryField(itemSummaryFields, 'Trigger', system.trigger || 'None');
        } else {
          addSummaryField(itemSummaryFields, 'Action', getActionTypeLabel(system.actionType));
        }
        addSummaryField(itemSummaryFields, 'Aura Action', !!system.auraAction);
        addSummaryField(itemSummaryFields, 'Range', system.range ?? 0);
        addSummaryField(itemSummaryFields, 'Requires Check', !!system.requiresCheck);
        if ((Number(system.recharge) || 0) > 0) addSummaryField(itemSummaryFields, 'Recharge', system.recharge);
        addSummaryField(itemSummaryFields, 'Dice', `${system.dice || 'None'} ${system.effectType === 'healing' ? 'Healing' : formatLabel(system.effectType || 'healing')}`.trim());
      } else if (context.item.type === 'weaponTechnique') {
        addSummaryField(itemSummaryFields, 'Weapon Skill', skillLabels[system.skill] ?? system.skill);
        addSummaryField(itemSummaryFields, 'Resource Cost to Begin', system.resourceCostToBegin ?? 0);
      }
      if (system.areaOfEffect && context.item.type !== 'armor') addSummaryField(itemSummaryFields, 'Area', `${getAreaShapeLabel(system.areaShape)} ${Number(system.areaSize) || 1}`);
      context.itemSummaryFields = itemSummaryFields;
      context.hasItemSummary = !!itemSummaryFields.length;
      return context;
    }

    _rememberOpenChoiceGroups(html) {
      this._openChoiceGroups = html.find('details[data-choice-group-id]').toArray()
        .filter((element) => element.open)
        .map((element) => `${element.dataset.choiceType}:${element.dataset.choiceGroupId}`)
        .filter(Boolean);
    }

    _restoreOpenChoiceGroups(html) {
      const openGroups = this._openChoiceGroups ?? [];
      html.find('details[data-choice-group-id]').each((_, element) => {
        element.open = openGroups.includes(`${element.dataset.choiceType}:${element.dataset.choiceGroupId}`);
      });
    }

    activateListeners(html) {
      super.activateListeners(html);
      this._restoreOpenChoiceGroups(html);
      html.find('details[data-choice-group-id]').on('toggle', () => this._rememberOpenChoiceGroups(html));
      html.find('details[data-choice-group-id] input, details[data-choice-group-id] select').on('change input', () => this._rememberOpenChoiceGroups(html));
      html.find('[data-edit-toggle]').change((event) => {
        this._editMode = event.currentTarget.checked;
        this.render();
      });
      html.find('[name="system.consumableEffect"]').change(async (event) => {
        await this.item.update({ 'system.consumableEffect': event.currentTarget.value });
        this.render();
      });
      html.find('[name="system.magicItemEffect"]').change(async (event) => {
        await this.item.update({ 'system.magicItemEffect': event.currentTarget.value });
        this.render();
      });
      html.find('input[name$=".areaOfEffect"]').change(async (event) => {
        await this.item.update({ [event.currentTarget.name]: event.currentTarget.checked });
        this.render();
      });
      html.find('select[name$=".areaShape"]').change(async (event) => {
        await this.item.update({ [event.currentTarget.name]: event.currentTarget.value });
        this.render();
      });
      html.find('[data-add-profession-skill-choice]').click(async (event) => {
        event.preventDefault();
        const groups = foundry.utils.deepClone(this.item.system?.skillChoiceGroups ?? {});
        const id = foundry.utils.randomID();
        groups[id] = { label: `Choice ${Object.keys(groups).length + 1}`, skills: {} };
        await this.item.update({ 'system.skillChoiceGroups': groups });
        this.render();
      });
      html.find('[data-remove-profession-skill-choice]').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const groupId = event.currentTarget.dataset.choiceGroupId;
        if (!groupId) return;
        this._openChoiceGroups = (this._openChoiceGroups ?? []).filter((key) => key !== `profession-skill:${groupId}`);
        await this.item.update({ [`system.skillChoiceGroups.-=${groupId}`]: null });
        this.render();
      });
      html.find('[data-add-race-language-choice]').click(async (event) => {
        event.preventDefault();
        const groups = foundry.utils.deepClone(this.item.system?.languageChoiceGroups ?? {});
        const id = foundry.utils.randomID();
        groups[id] = { label: `Language Choice ${Object.keys(groups).length + 1}`, mode: 'any', languages: {} };
        await this.item.update({ 'system.languageChoiceGroups': groups });
        this.render();
      });
      html.find('[data-remove-race-language-choice]').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const groupId = event.currentTarget.dataset.choiceGroupId;
        if (!groupId) return;
        this._openChoiceGroups = (this._openChoiceGroups ?? []).filter((key) => key !== `race-language:${groupId}`);
        await this.item.update({ [`system.languageChoiceGroups.-=${groupId}`]: null });
        this.render();
      });
      html.find('.item-effects-panel .remove-active-effect').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const effectId = event.currentTarget.dataset.effectId;
        if (!effectId) return;
        await this.item.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        this.render();
      });
      html.find('.item-effects-panel .create-active-effect').click(async (event) => {
        event.preventDefault();
        const [effect] = await this.item.createEmbeddedDocuments('ActiveEffect', [{
          name: 'New Active Effect',
          flags: { 'd100-system': { quantity: 1 } }
        }]);
        effect?.sheet?.render(true);
        this.render();
      });
      html.find('.item-effects-panel .active-effect-row').on('contextmenu', async (event) => {
        event.preventDefault();
        const effectId = event.currentTarget.dataset.effectId;
        if (!effectId) return;
        await this.item.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        this.render();
      }).click((event) => {
        if (event.target.closest('input, button')) return;
        const effect = this.item.effects.get(event.currentTarget.dataset.effectId);
        if (effect) effect.sheet?.render(true);
      });
      html.find('.item-effects-panel .active-effect-quantity').change(async (event) => {
        const effect = this.item.effects.get(event.currentTarget.dataset.effectId);
        if (!effect) return;
        await effect.update({ 'flags.d100-system.quantity': Math.max(0, Number(event.currentTarget.value) || 0) });
        this.render();
      });
      html.find('.item-effects-panel.active-effect-drop-zone').on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      }).on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      }).on('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = getDragItemData(event);
        if (!data || data.type !== 'ActiveEffect') return;
        const effect = await ActiveEffect.fromDropData(data);
        if (!effect) return;
        await this.item.createEmbeddedDocuments('ActiveEffect', [effect.toObject()]);
        this.render();
      });

      html.find('.category-trait-drop-zone').on('dragenter dragover', (event) => {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
      }).on('dragleave drop', (event) => {
        event.currentTarget.classList.remove('drag-over');
      }).on('drop', this._onCategoryTraitDrop.bind(this));

      html.find('.category-trait-open').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        const uuid = event.currentTarget.dataset.entryUuid;
        if (!uuid) return;
        fromUuid(uuid).then((traitItem) => traitItem?.sheet?.render(true));
      });

      html.find('.category-trait-row').on('contextmenu', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this._editMode) return;
        const bucketKey = event.currentTarget.dataset.bucketKey;
        const uuid = event.currentTarget.dataset.entryUuid;
        const bucket = categoryTraitBucketDefs.find((entry) => entry.key === bucketKey);
        if (!bucket || !uuid) return;
        const existing = Array.isArray(this.item.system?.[bucket.field]) ? foundry.utils.deepClone(this.item.system[bucket.field]) : [];
        const filtered = existing.filter((entry) => entry.uuid !== uuid);
        await this.item.update({ [`system.${bucket.field}`]: filtered });
        this.render();
      });
    }

    async _onCategoryTraitDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.item.type !== 'category') return;
      if (!this._editMode) {
        ui.notifications.warn('Enable Edit Mode to modify this Category.');
        return;
      }

      const bucketKey = event.currentTarget.dataset.bucketKey;
      const bucket = categoryTraitBucketDefs.find((entry) => entry.key === bucketKey);
      if (!bucket) return;

      const data = getDragItemData(event);
      const dragType = data?.type ?? data?.documentType ?? data?.document?.type ?? data?.data?.type;
      if (!data || (dragType !== 'Item' && dragType !== 'item')) return;

      let droppedItem = typeof Item.fromDropData === 'function' ? await Item.fromDropData(data) : null;
      if (!droppedItem && data.uuid) droppedItem = await fromUuid(data.uuid);
      if (!droppedItem || droppedItem.type !== 'trait') {
        ui.notifications.warn('Only Trait items can be added to a Category.');
        return;
      }

      const existing = Array.isArray(this.item.system?.[bucket.field]) ? foundry.utils.deepClone(this.item.system[bucket.field]) : [];
      if (existing.some((entry) => entry.uuid === droppedItem.uuid)) {
        ui.notifications.warn(`${droppedItem.name} is already in ${bucket.label}.`);
        return;
      }

      existing.push({
        uuid: droppedItem.uuid,
        name: droppedItem.name,
        img: droppedItem.img,
        description: String(droppedItem.system?.description ?? '').trim()
      });

      await this.item.update({ [`system.${bucket.field}`]: existing });
      this.render();
    }
  }

  class D100HazardSheet extends ActorSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['d100-system', 'sheet', 'actor', 'hazard-sheet'],
        template: 'systems/d100-system/templates/actor/hazard-sheet.hbs',
        width: 480,
        height: 620
      });
    }

    getData() {
      const context = super.getData();
      const system = context.actor.system ?? {};
      this._editMode = this._editMode ?? true;
      context.isEditMode = !!this._editMode;
      this._resistanceOpen = this._resistanceOpen ?? true;
      context.resistanceOpen = !!this._resistanceOpen;
      context.system = system;

      const resistanceValues = system.resistance && typeof system.resistance === 'object' ? system.resistance : {};
      context.resistanceRows = resistanceTypeOptions.map((option) => {
        const type = String(option.value).trim().toLowerCase();
        const value = Number(resistanceValues[type]) || 0;
        return { type, value, label: option.label };
      });

      context.healthValue = Number(system.health?.value) || 0;
      context.healthMax = Number(system.health?.max) || 0;
      context.healthPercent = context.healthMax > 0 ? Math.min(100, Math.max(0, (context.healthValue / context.healthMax) * 100)) : 0;
      context.degreeValue = Number(system.degreeOfSuccess?.value) || 0;
      context.degreeMax = Number(system.degreeOfSuccess?.max) || 0;
      context.degreePercent = context.degreeMax > 0 ? Math.min(100, Math.max(0, (context.degreeValue / context.degreeMax) * 100)) : 0;

      context.hazardActions = [...(context.actor.items ?? [])]
        .filter((item) => item.type === 'npcAction')
        .map((item) => {
          const recharge = Math.max(0, Math.floor(Number(item.system?.recharge) || 0));
          const recharging = recharge > 0 && !!item.flags?.['d100-system']?.recharging;
          const rechargeProgress = recharging
            ? Math.min(recharge, Math.max(0, Math.floor(Number(item.flags?.['d100-system']?.rechargeProgress) || 0)))
            : recharge;
          const effectType = String(item.system?.effectType ?? 'healing');
          return {
            id: item.id,
            name: item.name || 'Action',
            range: Number(item.system?.range) || 0,
            trigger: String(item.system?.trigger ?? '').trim(),
            dice: String(item.system?.dice ?? '').trim(),
            effectLabel: effectType === 'healing' ? 'Healing' : `${getResistanceTypeLabel(effectType)} Damage`,
            recharge,
            rechargeProgress,
            rechargePercent: recharge > 0 ? Math.min(100, (rechargeProgress / recharge) * 100) : 0,
            hasRecharge: recharge > 0,
            usable: !recharging
          };
        });

      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);
      if (!this.isEditable) return;

      html.find('[data-edit-toggle]').change((event) => {
        this._editMode = event.currentTarget.checked;
        this.render();
      });

      html.find('.hazard-resistance-block').on('toggle', (event) => {
        this._resistanceOpen = event.currentTarget.open;
      });

      html.find('.vital-field').change(async (event) => {
        const path = event.currentTarget.dataset.vitalPath;
        if (!path) return;
        let value = Number(event.currentTarget.value);
        if (!Number.isFinite(value)) value = 0;
        if (path === 'system.health.value') {
          value = Math.max(0, Math.min(value, Number(this.actor.system.health?.max) || 0));
        }
        await this.actor.update({ [path]: value });
        this.render();
      });

      html.find('.hazard-degree-adjust').click(async (event) => {
        const direction = Number(event.currentTarget.dataset.direction) || 0;
        const current = Number(this.actor.system.degreeOfSuccess?.value) || 0;
        const max = Number(this.actor.system.degreeOfSuccess?.max) || 0;
        let next = Math.max(0, current + direction);
        if (max > 0) next = Math.min(max, next);
        await this.actor.update({ 'system.degreeOfSuccess.value': next });
        this.render();
      });

      html.find('.hazard-action-use').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          const item = this.actor.items.get(event.currentTarget.dataset.itemId);
          if (!item) return;
          const executed = await executeNpcAction(this.actor, item, { skillCheck: null });
          if (!executed) ui.notifications.warn(`${item.name} could not be used (it may still be recharging).`);
          this.render();
        } catch (error) {
          console.error('D100 System | Hazard Action roll failed', error);
          ui.notifications.error('Something went wrong rolling that Action. See console (F12) for details.');
        }
      });

      html.find('.hazard-action-remove').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const itemId = event.currentTarget.dataset.itemId;
        if (!itemId) return;
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        this.render();
      });

      html.find('.npc-action-row').click((event) => {
        if (event.target.closest('button')) return;
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        item?.sheet?.render(true);
      });
    }
  }

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('d100-system', D100ActorSheet, {
    types: ['character', 'npc'],
    makeDefault: true,
    label: 'D100 Actor Sheet'
  });

  Actors.registerSheet('d100-system', D100HazardSheet, {
    types: ['hazard'],
    makeDefault: true,
    label: 'D100 Hazard Sheet'
  });

  Items.registerSheet('d100-system', D100ItemSheet, {
    types: ['gear', 'weapon', 'armor', 'talent', 'profession', 'race', 'spell', 'trait', 'npcAction', 'category', 'weaponTechnique'],
    makeDefault: true,
    label: 'D100 Item Sheet'
  });

  CONFIG.Actor.documentClass = D100Actor;
  CONFIG.Combat.documentClass = D100Combat;

  Hooks.on('combatStart', async (combat) => {
    if (!game.user.isGM || !(combat instanceof D100Combat)) return;
    await combat.update({
      'flags.d100-system.actedCombatants': [],
      'flags.d100-system.-=completedTurnCounts': null,
      'flags.d100-system.-=completedTurnRound': null,
      'flags.d100-system.combatStarted': false
    });
  });

  let d100PreviousCombatantId = null;

  Hooks.on('preUpdateCombat', (combat, changes) => {
    if (!(combat instanceof D100Combat)) return;
    if (typeof changes.turn === 'undefined' && typeof changes.round === 'undefined') return;
    d100PreviousCombatantId = combat.combatant?.id ?? null;
  });

  Hooks.on('updateCombat', (combat, changes) => {
    if (!(combat instanceof D100Combat)) return;

    const changesActivationState = typeof changes.turn !== 'undefined'
      || typeof changes.round !== 'undefined'
      || !!changes.flags?.['d100-system'];
    if (!changesActivationState) return;

    if (game.user.isGM && (typeof changes.turn !== 'undefined' || typeof changes.round !== 'undefined')) {
      const previousCombatant = d100PreviousCombatantId ? combat.combatants.get(d100PreviousCombatantId) : null;
      const newCombatant = combat.combatant;
      (async () => {
        if (previousCombatant?.actor && previousCombatant.id !== newCombatant?.id) {
          await processEndOfTurnConditions(previousCombatant.actor);
        }
        if (newCombatant?.actor && newCombatant.id !== previousCombatant?.id) {
          await processStartOfTurnConditions(newCombatant.actor);
        }
      })();
      d100PreviousCombatantId = newCombatant?.id ?? null;
    }

    if (typeof changes.round !== 'undefined') {
      if (game.user.isGM) {
        (async () => {
          for (const combatant of combat.combatants) {
            if (combatant.flags?.['d100-system']?.reactionUsed) {
              await combatant.update({ 'flags.d100-system.reactionUsed': false });
            }
          }
        })();
      }
      combat.combatants.forEach((combatant) => combatant.actor?.sheet?.render(false));
    }
    ui.combat?.render({ force: true });
  });

  Hooks.on('renderCombatTracker', (tracker, html) => {
    const combat = tracker.viewed ?? game.combat;
    if (!(combat instanceof D100Combat)) return;

    html.querySelectorAll('.combat-control[data-control="rollAll"], .combat-control[data-control="rollNPC"], .combat-control[data-control="roll"], .combat-control[data-control="nextTurn"], [data-control="rollAll"], [data-control="rollNPC"], [data-control="nextTurn"], [data-action="rollInitiative"], [data-action="rollAll"], [data-action="rollNPC"], [data-action="nextTurn"]').forEach((element) => {
      element.style.display = 'none';
    });

    const controls = html.querySelector('.combat-controls, .encounter-controls, footer');
    if (controls && !controls.querySelector('.d100-complete-active-turn')) {
      controls.insertAdjacentHTML('afterbegin', '<button type="button" class="d100-complete-active-turn"><i class="fas fa-check"></i> Complete Active Turn</button>');
    }
    const completeButton = html.querySelector('.d100-complete-active-turn');
    if (completeButton) {
      completeButton.disabled = !combat.flags?.['d100-system']?.combatStarted || !combat.combatant;
      if (!completeButton.dataset.d100Bound) {
        completeButton.dataset.d100Bound = 'true';
        completeButton.addEventListener('click', async (event) => {
          event.preventDefault();
          await combat.completeActiveTurn();
        });
      }
    }

    const unactedIds = combat.getUnactedCombatantIds();
    const eligibleIds = combat.getEligibleNextCombatantIds();
    html.querySelectorAll('[data-combatant-id]').forEach((element) => {
      const combatant = combat.combatants.get(element.dataset.combatantId);
      const isUnacted = unactedIds.includes(element.dataset.combatantId);
      const isEligible = eligibleIds.includes(element.dataset.combatantId);
      const disposition = Number(combatant?.token?.disposition ?? CONST.TOKEN_DISPOSITIONS?.NEUTRAL ?? 0);

      element.querySelector('.d100-combatant-vitals')?.remove();
      if (combatant?.actor?.type === 'character') {
        const actorSystem = combatant.actor.system ?? {};
        const resource = actorSystem.resource ?? {};
        const healthValue = Math.max(0, Number(actorSystem.health?.value) || 0);
        const healthMax = calculateHealthMax(combatant.actor);
        const resourceValue = Math.max(0, Number(resource.value) || 0);
        const resourceMax = Math.max(0, (Number(actorSystem.level) || 1) * 5 + (Number(resource.modifier) || 0));
        const resourceLabel = String(resource.type ?? 'resource').replace(/^./, (character) => character.toUpperCase());
        const defense = getEquippedArmorDefense(combatant.actor)
          + getActiveShieldDefense(combatant.actor)
          + (Number(actorSystem.defenseModifier) || 0);

        element.insertAdjacentHTML('beforeend', `
          <div class="d100-combatant-vitals">
            <span>Health ${healthValue}/${healthMax}</span>
            <span>${resourceLabel} ${resourceValue}/${resourceMax}</span>
            <span>Defense ${defense}</span>
          </div>
        `);
      } else if (combatant?.actor?.type === 'npc') {
        const actorSystem = combatant.actor.system ?? {};
        const healthValue = Math.max(0, Number(actorSystem.health?.value) || 0);
        const healthMax = calculateHealthMax(combatant.actor);
        const defense = (Number(actorSystem.defense) || 0)
          + getEquippedArmorDefense(combatant.actor)
          + getActiveShieldDefense(combatant.actor)
          + (Number(actorSystem.defenseModifier) || 0);
        const turnAllowance = combat.getTurnAllowance(combatant);
        const remainingTurns = combat.getRemainingTurnCount(combatant);

        element.insertAdjacentHTML('beforeend', `
          <div class="d100-combatant-vitals">
            <span>Health ${healthValue}/${healthMax}</span>
            <span>Defense ${defense}</span>
            <span>Turns ${remainingTurns}/${turnAllowance}</span>
          </div>
        `);
      }

      element.classList.remove(
        'd100-eligible-combatant',
        'd100-unacted-player',
        'd100-unacted-friendly-npc',
        'd100-unacted-neutral-npc',
        'd100-unacted-hostile-npc',
        'd100-unacted-secret-npc'
      );
      if (!isEligible) {
        element.querySelector('.d100-select-turn')?.remove();
      }
      if (!isUnacted || !combatant) return;

      if (!combat._isNpcTurn(combatant)) {
        element.classList.add('d100-unacted-player');
      } else if (disposition === (CONST.TOKEN_DISPOSITIONS?.HOSTILE ?? -1)) {
        element.classList.add('d100-unacted-hostile-npc');
      } else if (disposition === (CONST.TOKEN_DISPOSITIONS?.FRIENDLY ?? 1)) {
        element.classList.add('d100-unacted-friendly-npc');
      } else if (disposition === (CONST.TOKEN_DISPOSITIONS?.SECRET ?? -2)) {
        element.classList.add('d100-unacted-secret-npc');
      } else {
        element.classList.add('d100-unacted-neutral-npc');
      }

      if (isEligible && !element.querySelector('.d100-select-turn')) {
        element.insertAdjacentHTML('beforeend', '<button type="button" class="d100-select-turn" title="Start this turn" aria-label="Start this turn"><i class="fas fa-play"></i></button>');
      }
    });

    html.querySelectorAll('.d100-select-turn').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const combatantId = event.currentTarget.closest('[data-combatant-id]')?.dataset.combatantId;
        if (combatantId) await combat.selectCombatantTurn(combatantId);
      });
    });
  });

  Hooks.on('renderChatMessageHTML', (message, html) => {
    html.querySelectorAll('[data-d100-area-template]').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        await placeAreaTemplate({
          color: event.currentTarget.dataset.areaColor,
          size: event.currentTarget.dataset.areaSize,
          rayLength: event.currentTarget.dataset.areaRayLength,
          rayWidth: event.currentTarget.dataset.areaRayWidth,
          shape: event.currentTarget.dataset.areaConfigured === 'true' ? event.currentTarget.dataset.areaShape : ''
        });
      });
    });
    html.querySelectorAll('[data-apply-item-effects]').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const sourceActor = game.actors.get(event.currentTarget.dataset.actorId);
        const sourceItem = sourceActor?.items.get(event.currentTarget.dataset.itemId);
        const targets = [...(game.user?.targets ?? [])].filter((token) => token.actor);
        if (!sourceItem || !targets.length) {
          ui.notifications.warn('Target one or more tokens before applying effects.');
          return;
        }
        const effects = getItemEffects(sourceItem);
        for (const token of targets) {
          const copies = effects.map((effect) => {
            const effectData = effect.toObject();
            effectData.flags = foundry.utils.mergeObject(effectData.flags ?? {}, {
              'd100-system': { sourceItemId: sourceItem.id, appliedFromChat: true }
            });
            return effectData;
          });
          if (copies.length) await token.actor.createEmbeddedDocuments('ActiveEffect', copies);
        }
      });
    });
    html.querySelectorAll('[data-apply-effect]').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const amount = Math.max(0, Math.floor(Number(event.currentTarget.dataset.applyAmount) || 0));
        const damageType = String(event.currentTarget.dataset.applyType ?? 'healing').trim().toLowerCase();
        const half = event.currentTarget.dataset.applyHalf === 'true';
        const trackHealing = event.currentTarget.dataset.trackHealing === 'true';
        const healHealer = event.currentTarget.dataset.healHealer ?? '';
        const healSource = event.currentTarget.dataset.healSource ?? '';
        if (amount <= 0) return;
        const targets = [...(game.user?.targets ?? [])].filter((token) => token.actor);
        if (!targets.length) {
          ui.notifications.warn('Target one or more tokens before applying.');
          return;
        }
        for (const token of targets) {
          const result = await applyEffectToActor(token.actor, amount, damageType, { half });
          const verb = result.isHealing ? 'is healed for' : 'takes';
          const sourceAmountNote = result.half ? `${Math.floor(amount / 2)} (half of ${amount})` : `${amount}`;
          const reductionNote = !result.isHealing && (result.defenseApplied || result.resistanceApplied)
            ? ` (${sourceAmountNote} reduced by ${result.defenseApplied} Defense and ${result.resistanceApplied} Resistance)`
            : '';
          let trackerNote = '';
          if (trackHealing && result.isHealing && result.finalAmount > 0) {
            await recordHealingTrackerEntry(token.actor, healHealer, healSource);
            trackerNote = `<p><em>${token.actor.name}'s Healing Tracker updated (${healHealer} — ${healSource}).</em></p>`;
          }
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: token.actor }),
            content: `<p><strong>${token.actor.name}</strong> ${verb} <strong>${result.finalAmount}</strong> ${result.isHealing ? 'healing' : `${getResistanceTypeLabel(damageType)} damage`}${reductionNote}.</p><p>Health: ${result.newValue} / ${result.maxValue}</p>${trackerNote}`
          });
        }
      });
    });

    html.querySelectorAll('[data-inline-kind="roll"]').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const formula = event.currentTarget.dataset.inlineFormula;
        const damageType = String(event.currentTarget.dataset.inlineType ?? 'damage').trim().toLowerCase();
        if (!formula) return;
        let roll;
        try {
          roll = await new Roll(parseDiceExpression(formula)).evaluate();
        } catch (error) {
          console.error('D100 System | Inline roll failed', error);
          ui.notifications.error(`Could not roll "${formula}". See console (F12) for details.`);
          return;
        }
        const isHealing = damageType === 'healing';
        const label = isHealing ? 'Healing' : `${getResistanceTypeLabel(damageType)} Damage`;
        await ChatMessage.create({
          content: `<p><strong>${label}:</strong> ${roll.total} (${roll.formula})</p>${buildApplyEffectButton(roll.total, damageType)}`,
          rolls: [roll]
        });
      });
    });

    html.querySelectorAll('[data-inline-kind="condition"]').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const conditionKey = event.currentTarget.dataset.inlineCondition;
        const stacks = Math.max(1, Math.floor(Number(event.currentTarget.dataset.inlineStacks) || 1));
        const def = CONDITION_DEFS[conditionKey];
        if (!def) return;
        const targets = [...(game.user?.targets ?? [])].map((token) => token.actor).filter(Boolean);
        if (!targets.length) {
          ui.notifications.warn('Target one or more tokens before applying a condition.');
          return;
        }
        for (const actor of targets) {
          await applyConditionToActor(actor, def.key, stacks);
        }
        const stackLabel = def.stackable && stacks > 1 ? ` (x${stacks})` : '';
        await ChatMessage.create({
          content: `<p>Applied <strong>${def.label}${stackLabel}</strong> to ${targets.map((actor) => actor.name).join(', ')}.</p>`
        });
      });
    });

    html.querySelectorAll('[data-inline-kind="resource"]').forEach((button) => {
      if (button.dataset.d100Bound) return;
      button.dataset.d100Bound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const actorId = event.currentTarget.dataset.inlineActorId;
        const formula = event.currentTarget.dataset.inlineFormula;
        const direction = event.currentTarget.dataset.inlineDirection === 'loss' ? 'loss' : 'gain';
        const actor = game.actors.get(actorId);
        if (!actor || !formula) return;

        let roll;
        try {
          roll = await new Roll(parseDiceExpression(formula)).evaluate();
        } catch (error) {
          console.error('D100 System | Inline resource roll failed', error);
          ui.notifications.error(`Could not roll "${formula}". See console (F12) for details.`);
          return;
        }

        const resource = actor.system?.resource ?? {};
        const maxResource = Number(resource.max) || 0;
        const currentValue = Number(resource.value) || 0;
        const amount = Math.max(0, Math.floor(roll.total));
        const nextValue = direction === 'loss'
          ? Math.max(0, currentValue - amount)
          : Math.min(maxResource, currentValue + amount);

        await actor.update({ 'system.resource.value': nextValue });

        const resourceLabel = resource.type
          ? `${String(resource.type).charAt(0).toUpperCase()}${String(resource.type).slice(1)}`
          : 'Resource';
        const verb = direction === 'loss' ? 'loses' : 'gains';
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>${actor.name}</strong> ${verb} <strong>${amount}</strong> ${resourceLabel} (${roll.total} rolled, ${formula}).</p><p>${resourceLabel}: ${nextValue} / ${maxResource}</p>`,
          rolls: [roll]
        });
      });
    });
  });

  Hooks.on('hotbarDrop', async (bar, data, slot) => {
    if (data?.type !== 'd100SkillRoll') return;
    const actor = game.actors.get(data.actorId);
    if (!actor) {
      ui.notifications.warn('Actor not found for this skill macro.');
      return false;
    }
    const skillKey = data.skillKey;
    const skillLabel = skillLabels[skillKey] ?? data.skillLabel ?? skillKey;
    const macro = await Macro.create({
      name: `${actor.name}: ${skillLabel}`,
      type: 'script',
      img: actor.img || 'icons/svg/d20-grey.svg',
      command: `game.d100System.rollSkillMacro("${actor.id}", "${skillKey}");`
    });
    await game.user.assignHotbarMacro(macro, slot);
    return false;
  });

  Hooks.on('preCreateScene', (scene, data) => {
    const updates = {};
    const units = data.grid?.units;
    const distance = data.grid?.distance;
    if (!units || units === 'ft') updates['grid.units'] = 'Sq';
    if (!distance || distance === 5) updates['grid.distance'] = 1;
    if (Object.keys(updates).length) scene.updateSource(updates);
  });

  Hooks.on('createItem', async (item) => {
    if (isAutomaticEffectSource(item)) await syncAutomaticItemEffects(item);
  });
  Hooks.on('updateItem', async (item) => {
    if (isAutomaticEffectSource(item)) await syncAutomaticItemEffects(item);
    else if (item.type === 'armor') await clearAutomaticItemEffects(item);
  });
  Hooks.on('deleteItem', async (item) => {
    await clearAutomaticItemEffects(item);
  });
  Hooks.on('createActiveEffect', async (effect, options) => {
    if (options?.d100SkipAutomaticSync) return;
    if (isAutomaticEffectSource(effect.parent)) await syncAutomaticItemEffects(effect.parent);
  });
  Hooks.on('updateActiveEffect', async (effect, changes, options) => {
    if (options?.d100SkipAutomaticSync) return;
    if (isAutomaticEffectSource(effect.parent)) await syncAutomaticItemEffects(effect.parent);
  });
  Hooks.on('deleteActiveEffect', async (effect, options) => {
    if (options?.d100SkipAutomaticSync) return;
    if (isAutomaticEffectSource(effect.parent)) await syncAutomaticItemEffects(effect.parent);
  });

  Hooks.on('updateActor', async (actor, changes) => {
    if (!game.user.isGM) return;

    if (typeof changes.system?.health?.modifier !== 'undefined' || typeof changes.system?.resource?.modifier !== 'undefined') {
      await syncVitalModifierIndicators(actor);
    }

    const newHealthValue = changes.system?.health?.value;
    if (typeof newHealthValue === 'undefined') return;
    const dyingDef = CONDITION_DEFS.dying;
    const alreadyDying = getActorActiveConditions(actor).some((entry) => entry.key === 'dying');
    if (Number(newHealthValue) <= 0) {
      if (!alreadyDying) {
        await applyConditionToActor(actor, 'dying', 1);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p><strong>${actor.name}</strong> drops to 0 Health and gains the <strong>Dying</strong> condition. ${dyingDef.description}</p>`
        });
      }
    } else if (alreadyDying) {
      await removeConditionStacks(actor, 'dying', null);
    }
  });

  Hooks.once('ready', async () => {
    if (!game.user.isGM) return;
    for (const actor of game.actors) {
      for (const item of actor.items.filter((entry) => entry.type === 'race')) {
        if (!getItemEffects(item).length) {
          const sourceRace = game.items.find((entry) => entry.type === 'race' && entry.name === item.name && getItemEffects(entry).length);
          if (sourceRace) await replaceItemEffectsFromSource(item, sourceRace);
        }
        await syncAutomaticItemEffects(item);
      }
      await syncVitalModifierIndicators(actor);
    }
  });

  Hooks.on('updateToken', async (tokenDocument, changes) => {
    if (typeof changes.x === 'undefined' && typeof changes.y === 'undefined' && typeof changes.width === 'undefined' && typeof changes.height === 'undefined') return;

    const gridSize = tokenDocument.parent.grid.size ?? canvas.grid.size;
    const linkedRegions = tokenDocument.parent.regions.contents.filter((region) => region.flags?.['d100-system']?.radiusTokenId === tokenDocument.id);
    for (const region of linkedRegions) {
      const radiusSquares = Math.max(1, Number(region.flags?.['d100-system']?.radiusSquares) || 1);
      await region.update({ shapes: getRadiusShapes(tokenDocument, radiusSquares, gridSize, changes) });
    }
  });
});

Hooks.once('ready', () => {
  console.log('D100 System | Ready.');
  game.d100System.renderFateTracker();
  game.d100System.renderTrackersPanel();

  Hooks.on('updateSetting', (setting) => {
    if (setting.key === 'd100-system.fate') {
      game.d100System.renderFateTracker();
    }
    if (setting.key === 'd100-system.trackers') {
      game.d100System.renderTrackersPanel();
    }
  });

  Hooks.on('canvasReady', () => {
    game.d100System.renderTrackersPanel();
  });
});
